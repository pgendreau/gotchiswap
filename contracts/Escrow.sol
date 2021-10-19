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

    mapping(address => GotchiSale ) public gotchiSales;
    mapping(address => uint256) public balances;
    mapping(address => address) public buyers;

    constructor() {
    }

    function addSale(
        address _seller,
        uint256 _gotchi,
        uint256 _price,
        address _buyer
    ) private
    {
        require(
            !isSeller(_seller),
            "Cannot add sale: Seller already has ongoing sale"
        );

        GotchiSale storage sale = gotchiSales[_seller];

        sale.gotchi = _gotchi;
        sale.price = _price;
        sale.buyer = _buyer;

    }

    function getSale(address _seller) public returns (
        uint256,
        uint256,
        address
    ) {
        require(isSeller(_seller), "Cannot get sale: No sale found");
        GotchiSale storage sale = gotchiSales[_seller];

        return(sale.gotchi, sale.price, sale.buyer);
    }

    function addBuyer(address _buyer, address _seller) private {
        buyers[_buyer] = _seller;
    }

    function removeBuyer(address _buyer) private {
        buyers[_buyer] = address(0);
    }

    function isBuyer(address _buyer) private returns (bool) {
        // default is false
        return buyers[_buyer] != address(0);
    }

    function isSeller(address _seller) private returns (bool) {
        if (gotchiSales[_seller].price != 0) {
          return true;
        }
        return false;
    }

    function getSeller(address _buyer) external returns (address) {
        require(isBuyer(_buyer), "Cannot get seller: No sale found");
        return buyers[_buyer];
    }

    function removeSale(address _seller) private {
        require(isSeller(_seller), "Cannot remove sale: No sale found");
        // deleted sales have a price of 0
        gotchiSales[_seller].price = 0;
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
        addBuyer(_buyer, msg.sender);
        addSale(msg.sender, _gotchi, _price, _buyer);
        emit newSale(msg.sender, _gotchi);
    }

    function abortGotchiSale() external {
        require(isSeller(msg.sender), "Cannot abort: No sales found");
        removeSale(msg.sender);
        uint256 gotchi = gotchiSales[msg.sender].gotchi;
        aavegotchi.safeTransferFrom(address(this), msg.sender, gotchi, "");
        emit abortSale(msg.sender, gotchi);
    }

    function buyGotchi() external payable {
        require(isBuyer(msg.sender), "Cannot buy: No offer found");
        address seller = buyers[msg.sender];
        GotchiSale storage sale = gotchiSales[seller];
        // deposit amount to contract
        SafeERC20.safeTransferFrom(GHST, msg.sender, address(this), sale.price);
        removeSale(seller);
        removeBuyer(msg.sender);
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
