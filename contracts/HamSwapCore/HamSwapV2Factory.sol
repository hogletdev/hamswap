// SPDX-License-Identifier: MIT
pragma solidity =0.6.12;

import './interfaces/IHamSwapV2Factory.sol';
import './HamSwapV2Pair.sol';

contract HamSwapV2Factory is IHamSwapV2Factory {
    address public override feeTo;
    address public override feeToSetter;

    mapping(address => mapping(address => mapping(uint => address))) public override getPair;
    address[] public override allPairs;

    constructor(address _feeToSetter) public {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external override view returns (uint) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB, uint virt) external override returns (address pair) {
        require(tokenA != tokenB, 'HamSwapV2: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'HamSwapV2: ZERO_ADDRESS');
        require(getPair[token0][token1][virt] == address(0), 'HamSwapV2: PAIR_EXISTS'); // single check is sufficient
        bytes memory bytecode = type(HamSwapV2Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1, virt));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IHamSwapV2Pair(pair).initialize(token0, token1, virt);
        getPair[token0][token1][virt] = pair;
        getPair[token1][token0][virt] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(token0, token1, virt, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external override {
        require(msg.sender == feeToSetter, 'HamSwapV2: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external override {
        require(msg.sender == feeToSetter, 'HamSwapV2: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }
}
