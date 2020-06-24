export const environment = {
    "auth":         "https://auth.bitid.co.za",
    "appId":        "000000000000000000000003",
    "appName":      "Alerting",
    "alerting":     "http://127.0.0.1:5500",
    "production":   false,
    "roles": [
        {"value": 1, "title": "Read Only"},
        {"value": 2, "title": "Write Only"},
        {"value": 3, "title": "Read/Write"},
        {"value": 4, "title": "Admin"},
        {"value": 5, "title": "Owner"}
    ],
    "scopes": [
        {"url": "/users/get", "role": 4},
        
        {"url": "/apps/load", "role": 4},
        
        {"url": "/alerting/senders/get", "role": 4},
        {"url": "/alerting/senders/list", "role": 4},
        {"url": "/alerting/senders/share", "role": 4},
        {"url": "/alerting/senders/update", "role": 4},
        {"url": "/alerting/senders/revoke", "role": 5},
        {"url": "/alerting/senders/retrieve", "role": 4},
        {"url": "/alerting/senders/generate", "role": 4},
        {"url": "/alerting/senders/unsubscribe", "role": 4},
        {"url": "/alerting/senders/updatesubscriber", "role": 4},
    ]
};