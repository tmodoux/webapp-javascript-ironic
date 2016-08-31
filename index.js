var connection;
var stream = 'amperometry';
var container = document.getElementById("pryvGraphs");
var monitor;

// AUTH

// Preliminary step: use staging environment (remove for use on production infrastructure)
pryv.Auth.config.registerURL = {host: 'reg.pryv-switch.ch', 'ssl': true};

// Authenticate user
var authSettings = {
    requestingAppId: 'ironic-webapp',
    requestedPermissions: [
        {
            streamId: '*',
            level: 'manage'
        }
    ],
    // set this if you don't want a popup
    returnURL: false,
    // use the built-in auth button (optional)
    spanButtonID: 'pryv-button',
    callbacks: {
        initialization: function () {
            // optional (example use case: display "loading" notice)
        },
        needSignin: function (popupUrl, pollUrl, pollRateMs) {
            resetGraphs();
        },
        needValidation: null,
        signedIn: function (connect, langCode) {
            connection = connect;
            loadGraphs();
        },
        refused: function (reason) {
        },
        error: function (code, message) {
        }
    }
};

pryv.Auth.setup(authSettings);

// MONITORING

// Setup monitoring for remote changes
function setupMonitor() {
    var filter = new pryv.Filter({streamsIds: [stream]});
    monitor = connection.monitor(filter);

    // should be false by default, will be updated in next lib version
    // to use fullCache call connection.ensureStructureFetched before
    monitor.ensureFullCache = false;
    monitor.initWithPrefetch = 0; // default = 100;

    // get notified when monitoring starts
    monitor.addEventListener(pryv.MESSAGES.MONITOR.ON_LOAD, function (events) {
        updateGraph(monitor.getEvents());
    });

    // get notified when data changes
    monitor.addEventListener(pryv.MESSAGES.MONITOR.ON_EVENT_CHANGE, function (changes) {
        updateGraph(monitor.getEvents());
    });

    // start monitoring
    monitor.start(function (err) {
    });
}

// GRAPHS

function loadGraphs() {
    // Initialize graph
    var graph = document.createElement('div');
    graph.setAttribute("id", stream);
    container.appendChild(graph);

    // Initialize monitor
    setupMonitor();
}

function updateGraph(events) {
    var time = events.map(function (e) {
        return e.getData().time;
    });
    var current = events.map(function (e) {
        return e.getData().content;
    });
    var trace = {x: time, y: current, mode: "lines", name: "Trace1", type: "scatter"};
    var layout = {
        title: "Chrono Amperometry (from Pryv)",
        xaxis1: {
            anchor: "y1",
            domain: [0.0, 1.0],
            title: "Time (seconds)"
        },
        yaxis1: {
            anchor: "x1",
            domain: [0.0, 1.0],
            title: "Current (uA)"
        }};
    Plotly.newPlot("amperometry", [trace], layout);
}

function resetGraphs() {
    if (monitor) {
        monitor.destroy();
    }
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}