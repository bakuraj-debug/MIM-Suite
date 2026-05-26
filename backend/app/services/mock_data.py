INCIDENT = {
    "incidentId": "INC16852714",
    "priority": "P1 Critical",
    "status": "Active / Investigating",
    "location": "Europe · Russia · Stupino PO1",
    "application": "gTMS Print Service",
    "issue": "Unable to print shipment lists",
    "businessImpact": "15 trucks delayed, 45 trucks queuing, 3,200+ users affected",
    "rootCause": "Archive diskgroup saturation at 97%",
    "runbook": "RB-2241",
    "contacts": {
        "resolverManager": "Khushboo Atri",
        "dba": "Rajesh Kumar",
        "serviceOwner": "Dmitriy Sokolov",
        "vpEngineering": "Vandana Sharma",
        "ctoOnCall": "James Mitchell",
    },
    "slaSecondsRemaining": 7260,
}

TIMELINE = {
    "items": [
        {"time": "08:12 UTC", "event": "Alert triggered for print service failures"},
        {"time": "08:19 UTC", "event": "Major incident bridge opened"},
        {"time": "08:34 UTC", "event": "Traversal AI suggested diskgroup saturation pattern"},
    ]
}

ACTIONS = {
    "items": [
        {"id": "A-101", "owner": "Rajesh Kumar", "task": "Free archive disk space by 20%", "status": "In Progress"},
        {"id": "A-102", "owner": "Khushboo Atri", "task": "Broadcast update to logistics ops", "status": "Pending Approval"},
    ]
}
