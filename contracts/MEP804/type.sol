// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

// Sensor data
// Compres type, 0: plain, 1: brotli
struct SensorData {
    uint8 compressType;
    bytes data;
}
