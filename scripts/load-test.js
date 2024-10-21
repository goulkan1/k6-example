
import { check } from 'k6';
import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics'; // Import Counter and Trend for response time

export const options = {
    scenarios: {
        default: {
            executor: 'constant-vus',
            vus: 10, // Number of virtual users
            duration: '10s', // Total test duration
        },
    },
    thresholds: {
        user_registration_counter_success: ['count>290'], // Ensure at least 290 successes
        user_registration_counter_error: ['count<10'], // Ensure fewer than 10 errors
        'http_req_duration': ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

// Create success and error counters
const registerCounterSuccess = new Counter('user_registration_counter_success');
const registerCounterError = new Counter('user_registration_counter_error');

// Create a trend to track response times
const responseTimeTrend = new Trend('response_time');

// Function to generate a random `partnerReferenceNo`
function generatePartnerReferenceNo() {
    const randomNumber = Math.floor(100000000000 + Math.random() * 900000000000);
    return `MB-${randomNumber}`;
}

export default function () {
    // Define the dynamic payload for the POST request
    const url = 'http://localhost:8080/';
    const payload = JSON.stringify({
        "beneficiaryBankCode": "011",
        "partnerReferenceNo": generatePartnerReferenceNo(),
        "beneficiaryAccountNo": "0054870833",
        "additionalInfo": {}
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Send a POST request
    const res = http.post(url, payload, params);

    // Track the response time
    responseTimeTrend.add(res.timings.duration);

    // Use `check()` to verify if the response status is 200
    const isSuccess = check(res, {
        'status is 200': (r) => r.status === 200,
        'content-type is JSON': (r) => r.headers['Content-Type'] === 'application/json',
        'response time is < 500ms': (r) => r.timings.duration < 500,
    });

    // Increment counters based on the result
    if (isSuccess) {
        registerCounterSuccess.add(1);
    } else {
        registerCounterError.add(1);
    }
}
