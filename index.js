var connection;
var streams = ['amperometry','voltammetry'];
var container = document.getElementById("graphs");
var selector = document.getElementById("selector");

// AUTH

// Preliminary step: use staging environment (remove for use on production infrastructure)
pryv.Auth.config.registerURL = { host: 'reg.pryv-switch.ch', 'ssl': true };

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
        needSignin: function(popupUrl, pollUrl, pollRateMs) {
            resetGraphs();
        },
        needValidation: null,
        signedIn: function(connect, langCode) {
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
function setupMonitor(streamId) {
    var filter = new pryv.Filter({streamsIds: [streamId]});
    var monitor = connection.monitor(filter);

    // should be false by default, will be updated in next lib version
    // to use fullCache call connection.ensureStructureFetched before
    monitor.ensureFullCache = false;
    monitor.initWithPrefetch = 0; // default = 100;

    // get notified when monitoring starts
    monitor.addEventListener(pryv.MESSAGES.MONITOR.ON_LOAD, function (events) {
        updateGraph(streamId,monitor.getEvents());
    });

    // get notified when data changes
    monitor.addEventListener(pryv.MESSAGES.MONITOR.ON_EVENT_CHANGE, function (changes) {
        updateGraph(streamId,monitor.getEvents());
    });

    // start monitoring
    monitor.start(function (err) {
    });
}

// GRAPHS

function loadGraphs() {
    resetGraphs();

    streams.forEach(function(stream) {
        // Initialize graphs selector
        var option = document.createElement("option");
        option.setAttribute("value", stream);
        var title = document.createTextNode(stream);
        option.appendChild(title);
        selector.appendChild(option);

        // Initialize graphs
        var graph = document.createElement('div');
        graph.setAttribute("id", stream);
        container.appendChild(graph);

        // Initialize monitors
        setupMonitor(stream);
    });
}

function updateGraph(stream,events) {
    if(stream == "amperometry") {
        var time = events.map(function (e) {if(e.getData().type=="electric-current/a") return e.getData().time; });
        var current = events.map(function (e) {if(e.getData().type=="electric-current/a") return e.getData().content; });
        var trace = {x: time, y: current, mode: "lines", name: "Trace1", type: "scatter"};
        var layout = {title: "Amperometry"};
        Plotly.newPlot("amperometry", [trace], layout);
    } else if(stream == "voltammetry") {
        var voltage = events.map(function (e) {if(e.getData().type=="electromotive-force/v") return e.getData().content; });
        var current = events.map(function (e) {if(e.getData().type=="electric-current/a") return e.getData().time; });
        var trace = {x: voltage, y: current, mode: "lines", name: "Trace1", type: "scatter"};
        var layout = {title: "Voltammetry"};
        Plotly.newPlot("voltammetry", [trace], layout);
    }
}

function resetGraphs() {

}