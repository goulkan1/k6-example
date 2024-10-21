import { check } from 'k6';
import http from 'k6/http';

export let options = {
    scenarios: {
        default: {
            executor: 'constant-vus',
            vus: 10, // Number of virtual users
            duration: '10s', // Total test duration
        },
    },
};

export default function () {
    let url = 'http://localhost:8080';
    let headers = { 'Content-Type': 'application/json' };
    let payload = JSON.stringify({
        "originalPartnerReferenceNo": "524325667127",
        "originalReferenceNo": "2020102977770000000009",
        "originalExternalId": "30443786930722726463280097920912",
        "serviceCode": "17",
        "transactionDate": "2019-07-03T12:08:56-07:00",
        "amount": {
            "value": "12345678.00",
            "currency": "IDR"
        },
        "additionalInfo": {
            "deviceId": "12345679237",
            "channel": "mobilephone",
            "transferType": "intrabank"
        }
    });

    let res = http.post(url, payload, { headers: headers });

    check(res, {
        'status is 200': (r) => r.status === 200,
        'content-type is JSON': (r) => r.headers['Content-Type'] === 'application/json',
    });
}
