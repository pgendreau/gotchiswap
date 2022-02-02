// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity 0.8.4;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { IERC721 } from "./interfaces/IERC721.sol";

contract Escrow {

    //address public gotchiAddress = 0x86935F11C86623deC8a25696E1C19a8659CbF95d;
    //address public tokenAddress = 0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7;

    // kovan
    address public gotchiAddress = 0x07543dB60F19b9B48A69a7435B5648b46d4Bb58E;
    address public tokenAddress = 0xeDaA788Ee96a0749a2De48738f5dF0AA88E99ab5;
    IERC721 aavegotchi = IERC721(gotchiAddress);
    IERC20 GHST = IERC20(tokenAddress);

    //  state events
    event newSale(address indexed seller, uint256 indexed gotchi);
    event concludeSale(address indexed buyer, uint256 indexed gotchi);
    event abortSale(address indexed seller, uint256 indexed gotchi);

    struct GotchiSale {
        uint256 gotchi;
        uint256 price;
        address buyer;
    }

    struct SaleRef {
        address seller;
        uint256 index;
    }

    mapping(address => GotchiSale[]) sellers;
    mapping(address => SaleRef[]) buyers;

    address public admin = 0xfEC36843fcADCbb13B7b14aB12403d45Df6dEc4E;

    constructor() {
    }

    modifier onlyAdmin {
        require(msg.sender == admin);
        _;
    }

    function changeAdmin(address _admin) public onlyAdmin {
        admin = _admin;
    }

    function withdrawERC721(uint256 _tokenId) public onlyAdmin {
        aavegotchi.safeTransferFrom(address(this), admin, _tokenId, "");
    }

    function withdrawGHST() public onlyAdmin {
        SafeERC20.safeTransferFrom(
            GHST,
            address(this),
            admin,
            GHST.balanceOf(address(this))
        );
    }

    function addSale(
        address _seller,
        uint256 _gotchi,
        uint256 _price,
        address _buyer
    ) private
    {
        // add sale to seller
        sellers[_seller].push(GotchiSale(_gotchi, _price, _buyer));
        uint256 sale_index = sellers[_seller].length - 1;
        // add reference to buyer
        buyers[_buyer].push(SaleRef(_seller, sale_index));
    }

    function getOffer(address _buyer, uint256 _index) public view returns (
        address,
        uint256
    ) {
        require(isBuyer(_buyer), "Cannot get offer: No offers found");

        SaleRef storage offer = buyers[_buyer][_index];

        return(offer.seller, offer.index);
    }

    function getSale(address _seller, uint256 _index) public view returns (
        uint256,
        uint256,
        address
    ) {
        require(isSeller(_seller), "Cannot get sale: No sales found");

        GotchiSale storage sale = sellers[_seller][_index];

        return(sale.gotchi, sale.price, sale.buyer);
    }

    function removeSale(address _seller, uint256 _index ) private {
        require(isSeller(_seller), "Cannot remove sale: No sales found");

        // the buyer for that sale
        address buyer = sellers[_seller][_index].buyer;
        // the gotchi for that sale
        uint256 gotchi = sellers[_seller][_index].gotchi;
        // number of sales for that buyer
        uint256 buyer_sales = buyers[buyer].length;

        // for each sales of the buyer
        for(uint i=0; i < buyer_sales; i++) {
            // if from that seller
            if (buyers[buyer][i].seller == _seller) {
                // get the sale index
                uint256 sale_index = buyers[buyer][i].index;
                // check if it is for that particular gotchi
                if (sellers[_seller][sale_index].gotchi == gotchi) {
                    // if so remove offer
                    for(uint j=i; j < buyer_sales -1; j++) {
                        buyers[buyer][j] = buyers[buyer][j+1];
                    }
                    // remove last offer
                    buyers[buyer].pop();
                    break;
                }
            }
        }

        // update seller's sales
        uint256 length = sellers[_seller].length;
        // remove sale (preserve order)
        for (uint i = _index; i < length - 1; i++) {
	        sellers[_seller][i] = sellers[_seller][i+1];
        }
        sellers[_seller].pop();
    }

    function isBuyer(address _buyer) private view returns (bool) {
        // default is false
        if (buyers[_buyer].length > 0) {
            return true;
        }
        return false;
    }

    function isSeller(address _seller) private view returns (bool) {
        if (sellers[_seller].length > 0) {
          return true;
        }
        return false;
    }

    function getBuyerSalesCount(address _buyer) external view returns (uint256) {
        require(isBuyer(_buyer), "No sales found");
        return buyers[_buyer].length;
    }

    function getSellerSalesCount(address _seller) external view returns (uint256) {
        require(isSeller(_seller), "No sales found");
        return sellers[_seller].length;
    }

    function sellGotchi(
        uint256 _gotchi,
        uint256 _price,
        address _buyer
    ) external
    {
        require(
            _price > 0,
            "Cannot add sale: Price must be greater than 0"
        );
        // transfer gotchi to contract
        aavegotchi.safeTransferFrom(msg.sender, address(this), _gotchi, "");
        addSale(msg.sender, _gotchi, _price, _buyer);
        emit newSale(msg.sender, _gotchi);
    }

    function abortGotchiSale(uint256 _index) external {
        require(isSeller(msg.sender), "Cannot abort: No sales found");
        uint256 gotchi = sellers[msg.sender][_index].gotchi;
        removeSale(msg.sender, _index);
        aavegotchi.safeTransferFrom(address(this), msg.sender, gotchi, "");
        emit abortSale(msg.sender, gotchi);
    }

    function buyGotchi(uint256 _index) external {
        require(isBuyer(msg.sender), "Cannot buy: No offers found");

        address seller = buyers[msg.sender][_index].seller;
        uint256 sale_index = buyers[msg.sender][_index].index;
        GotchiSale storage sale = sellers[seller][sale_index];

        uint256 gotchi = sale.gotchi;
        uint256 price = sale.price;

        removeSale(seller, sale_index);

        // deposit amount to contract
        SafeERC20.safeTransferFrom(GHST, msg.sender, address(this), price);
        // transfer gotchi to buyer
        aavegotchi.safeTransferFrom(address(this), msg.sender, gotchi, "");
        // send amount to seller
        SafeERC20.safeTransferFrom(GHST, address(this), seller, price);
        emit concludeSale(msg.sender, gotchi);
    }

    function onERC721Received(
        address, /* _operator */
        address, /*  _from */
        uint256, /*  _tokenId */
        bytes calldata /* _data */
    )
        external
        pure
        returns (bytes4)
    {
        return bytes4(
            keccak256("onERC721Received(address,address,uint256,bytes)")
        );
    }

}
