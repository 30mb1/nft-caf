pragma solidity ^0.8.20;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    struct Round {
        uint price; // 18 decimals, native USDC
        uint16 limit; // remaining NFT to mint
        uint16 offset; // start ID
        uint8 maxPerUser; // max mints per user
        bool started;
    }

    Round[] public rounds;
    // user => amount of nfts bought for round
    mapping (address => mapping (uint => uint)) public roundNfts;
    address public beneficiary;
    string public baseURI;

    constructor(address _owner, address _beneficiary, string memory _baseUri) ERC721("CAFF", "CAFF") Ownable(_owner) {
        beneficiary = _beneficiary;
        baseURI = _baseUri;

        rounds.push(Round(3300000000000000000, 5000, 0, 50, false));
        rounds.push(Round(4400000000000000000, 3000, 5000, 30, false));
        rounds.push(Round(5500000000000000000, 1000, 8000, 10, false));
        rounds.push(Round(6600000000000000000, 666, 9000, 6, false));
        rounds.push(Round(7700000000000000000, 333, 9666, 3, false));
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory baseUri = _baseURI();
        string memory extended = bytes(baseUri).length > 0 ? string.concat(baseUri, tokenId.toString()) : "";
        return string.concat(extended, ".json");
    }

    function setBaseUri(string calldata _baseUri) external onlyOwner {
        baseURI = _baseUri;
    }

    function setBeneficiary(address _beneficiary) external onlyOwner {
        beneficiary = _beneficiary;
    }

    function startRound(uint idx) external onlyOwner {
        rounds[idx].started = true;
    }

    function setPrice(uint idx, uint _price) external onlyOwner {
        rounds[idx].price = _price;
    }

    function buyNFT(uint idx, uint16 count) external payable {
        Round memory round = rounds[idx];

        require (idx < rounds.length, "Bad round idx"); // correct round
        require (round.started, "Round not started"); // round started
        require (round.limit > count, "Round limit reached"); // enough nft remaining
        require (msg.value == round.price * count, "Bad value sent"); // correct value sent
        require (roundNfts[msg.sender][idx] + count <= round.maxPerUser, "User round limit reached"); // user can buy this amount

        // mint to user requested NFTs
        for (uint i = 0; i < count; i++) {
            _mint(msg.sender, round.offset + i);
        }
        round.offset += count;
        round.limit -= count;
        rounds[idx] = round; // save updated roundbuyN
        roundNfts[msg.sender][idx] += count; // update user round limits
        payable(beneficiary).transfer(msg.value);
    }
}