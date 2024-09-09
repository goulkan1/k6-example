import { check } from 'k6';
import http from 'k6/http';
import { Counter } from 'k6/metrics'; // Import Counter

export const options = {
    scenarios: {
        default: {
            executor: 'constant-vus',
            vus: 10, // Number of virtual users
            duration: '10s', // Total test duration
            // gracefulStop: '30s', // Graceful stop to finish any in-flight requests
        },

    },
    thresholds: {
        user_registration_counter_success: ['count>190'], // Ensure at least 190 successes
        user_registration_counter_error: ['count<10'], // Ensure fewer than 10 errors
    },
};

// Create success and error counters
const registerCounterSuccess = new Counter('user_registration_counter_success');
const registerCounterError = new Counter('user_registration_counter_error');

export default function () {
    const res = http.get('https://test-api.k6.io/public/crocodiles/');

    // Use `check()` to verify if the response status is 200
    const isSuccess = check(res, {
        'status is 200': (r) => r.status === 200,
    });

    // Increment counters based on the result
    if (isSuccess) {
        registerCounterSuccess.add(1);
    } else {
        registerCounterError.add(1);
    }
}
