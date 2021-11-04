pragma solidity 0.8.4;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { IERC721 } from "./interfaces/IERC721.sol";

contract Escrow {

    address public gotchiAddress = 0x86935F11C86623deC8a25696E1C19a8659CbF95d;
    address public tokenAddress = 0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7;
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

    mapping(address => GotchiSale[]) public sellers;
    mapping(address => SaleRef[]) public buyers;

    constructor() {
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

    function getSale(address _seller, uint256 _index) public returns (
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

        uint256 length = sellers[_seller].length;
        address buyer = sellers[_seller][_index].buyer;
        uint256 gotchi = sellers[_seller][_index].gotchi;
        uint256 buyer_sales = buyers[buyer].length;

        sellers[_seller][_index] = sellers[_seller][length - 1];
        sellers[_seller].pop();

        for(uint i=0; i < buyer_sales; i++) {
            if (buyers[buyer][i].seller == _seller) {
                uint256 sale_index = buyers[buyer][i].index;
                if (sellers[_seller][sale_index].gotchi == gotchi) {
                    buyers[buyer][i] = buyers[buyer][buyer_sales - 1];
                    buyers[buyer].pop();
                }
            }
        }
    }

    function isBuyer(address _buyer) private returns (bool) {
        // default is false
        if (buyers[_buyer].length > 0) {
            return true;
        }
        return false;
    }

    function isSeller(address _seller) private returns (bool) {
        if (sellers[_seller].length > 0) {
          return true;
        }
        return false;
    }

    function getBuyerSalesCount(address _buyer) external returns (uint256) {
        require(isBuyer(_buyer), "No sales found");
        return buyers[_buyer].length;
    }

    function getSellerSalesCount(address _seller) external returns (uint256) {
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
            !isSeller(msg.sender),
            "Cannot add sale: Sale already in progress"
        );
        // sales with price = 0 are deleted sales
        require(
            _price > 0,
            "Cannot add sale: Price must be greater than 0"
        );
        // transfer gotchi to contract
        aavegotchi.safeTransferFrom(msg.sender, address(this), _gotchi, "");
        //addBuyer(_buyer, msg.sender);
        addSale(msg.sender, _gotchi, _price, _buyer);
        emit newSale(msg.sender, _gotchi);
    }

    function abortGotchiSale(uint256 _index) external {
        require(isSeller(msg.sender), "Cannot abort: No sales found");
        removeSale(msg.sender, _index);
        uint256 gotchi = sellers[msg.sender][_index].gotchi;
        aavegotchi.safeTransferFrom(address(this), msg.sender, gotchi, "");
        emit abortSale(msg.sender, gotchi);
    }

    function buyGotchi(uint256 _index) external payable {
        require(isBuyer(msg.sender), "Cannot buy: No offers found");

        address seller = buyers[msg.sender][_index].seller;
        uint256 sale_index = buyers[msg.sender][_index].index;
        GotchiSale storage sale = sellers[seller][sale_index];

        // deposit amount to contract
        SafeERC20.safeTransferFrom(GHST, msg.sender, address(this), sale.price);
        removeSale(seller, sale_index);
        // transfer gotchi to buyer
        aavegotchi.safeTransferFrom(address(this), msg.sender, sale.gotchi, "");
        // send amount to seller
        SafeERC20.safeTransferFrom(GHST, address(this), seller, sale.price);
        emit concludeSale(msg.sender, sale.gotchi);
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
