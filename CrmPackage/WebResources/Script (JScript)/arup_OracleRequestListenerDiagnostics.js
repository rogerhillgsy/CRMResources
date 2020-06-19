(function (doc, win, add, remove, loaded, load) {
    doc.ready = new Promise(function (resolve) {
        if (doc.readyState === 'complete') {
            resolve();
        } else {
            function onReady() {
                resolve();
                doc[remove](loaded, onReady, true);
                win[remove](load, onReady, true);
            }
            doc[add](loaded, onReady, true);
            win[add](load, onReady, true);
        }
    });
})(document, window, 'addEventListener', 'removeEventListener', 'DOMContentLoaded', 'load');

function AddButtonCallback(buttonId, actionName, resultAreaId) {
    document.getElementById(buttonId).addEventListener('click', function () {
        var arup_actionrequest = {
            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {},
                    operationType: 0,
                    operationName: actionName
                };
            }
        };
        debugger;

        Xrm.WebApi.online.execute(arup_actionrequest).then(
            function success(result) {
                if (result.ok) {
                    var results = JSON.parse(result.responseText);
                    var resultArea = document.getElementById(resultAreaId);
                    resultArea.innerText = results.Result;
                }
            },
            function (error) {
                Xrm.Utility.alertDialog(actionName + error.message);
            }
        );
    });
};

debugger;
document.ready.then(() => {
    AddButtonCallback("PingButton", "arup_A03Ping", "PingResult");
    AddButtonCallback("CheckConnectionButton", "arup_A14CheckConnection", "CheckConnectionResult");
});