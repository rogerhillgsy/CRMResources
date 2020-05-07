/// <reference path="./libraries/autoComplete.js"/>
/// <reference path="./libraries/index.js"/>
function setupAutocomplete() {
    var countryAc = new autoComplete({
        data: {
            src: () => {
                var input = document.querySelector("#project_countryac").value;
                return new Promise(function(resolve, reject) {
                        $.ajax({
                            type: "GET",
                            contentType: "application/json; charset=utf-8",
                            datatype: "json",
                            url: Xrm.Page.context.getClientUrl() +
                                "/api/data/v8.2/ccrm_countries?$select=ccrm_arupcountrycode,ccrm_name&$filter=" +
                                encodeURIComponent("statuscode eq 1 and ") +
                                "contains(ccrm_name,'" +
                                input +
                                "')" +
                                "&$orderby=ccrm_name asc",
                            beforeSend: function(XMLHttpRequest) {
                                XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
                                XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
                                XMLHttpRequest.setRequestHeader("Accept", "application/json");
                                XMLHttpRequest.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
                            },
                            async: true,
                            success: function(data, textStatus, xhr) {
                                var results = data;
                                resolve(data.value);
                                //var countries = "";
                                //for (var i = 0; i < results.value.length; i++) {
                                //    var ccrm_arupcountrycode = results.value[i]["ccrm_arupcountrycode"];
                                //    var ccrm_name = results.value[i]["ccrm_name"];
                                //    var ccrm_countryid = results.value[i]["ccrm_countryid"];
                                //    countries += '<option value="' + ccrm_name + '" data-value="' + ccrm_countryid + '" > ' + ccrm_arupcountrycode + " - " + ccrm_name + '</option > ';
                                //}
                                //document.getElementById('countries').innerHTML = countries;
                            },
                            error: reject
                        });
                    }
                );
            },
            key: ['ccrm_name'],
            cache: false,
        },
        sort (a, b) {
            if (a.ccrm_name < b.ccrm_name) return -1;
            if (a.ccrm_name > b.ccrm_name) return 1;
            return 0;
        },
        placeHolder: "Project Country",
        selector: "#project_countryac",
        threshold: 2,
        debounce: 300,
        searchEngine: "strict",
        resultsList : {
            render: true,
            container: source => {
                debugger;
                source.setAttribute("id", "country_list");
            },
            element : "li"
        },
        maxResults: 5,
        resultItem : {
            content: (data, source) => {
                debugger;
                source.innerHTML = data.match;
            },
            element : 'li'
        },
        noResults: () => {
            var result = document.createElement("li");
            result.setAttribute("class", "no_result");
            result.setAttribute("tabindex", "1");
            result.innerHTML = "No Results";
            document.querySelector("#autoComplete_list").appendChild(result);
        },
        onSelection: feedback => {
            debugger;
            getStates();
        }
    });
}