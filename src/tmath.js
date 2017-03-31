"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 数学関連のクラス
var TM;
(function (TM) {
    TM.EQUAL_THRESHOLD = 1e-5;
    function IsEqual(f0, f1) {
        return Math.abs(f0 - f1) <= TM.EQUAL_THRESHOLD;
    }
    TM.IsEqual = IsEqual;
    function Deg2rad(deg) {
        return (deg / 180) * Math.PI;
    }
    TM.Deg2rad = Deg2rad;
    function Rad2deg(rad) {
        return rad / Math.PI * 180;
    }
    TM.Rad2deg = Rad2deg;
    function Square(v) {
        return v * v;
    }
    TM.Square = Square;
    function GCD(a, b) {
        if (a === 0 || b === 0)
            return 0;
        while (a !== b) {
            if (a > b)
                a -= b;
            else
                b -= a;
        }
        return a;
    }
    TM.GCD = GCD;
    function LCM(a, b) {
        var div = TM.GCD(a, b);
        if (div === 0)
            return 0;
        return (a / div) * b;
    }
    TM.LCM = LCM;
})(TM || (TM = {}));
console.log("HELLO");
exports.default = TM;
