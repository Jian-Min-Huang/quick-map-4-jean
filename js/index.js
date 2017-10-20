$(document).ready(function () {
    if (navigator.userAgent.match(/Mobile/i) && !window.location.pathname.match(/index_m\.html/i)) {
        window.location = "./index_m.html";
    } else if (!window.location.pathname.match(/index\.html/i)) {
        window.location = "./index.html";
    }

    initMap(0);
});

var map = null;
var names = [];
var errorNames = [];
var markers = [];
var infoWindows = [];

/**
 * type 0 when page init
 * type 1 when process
 */
function initMap(type) {
    var officeLocation = new google.maps.LatLng(24.983952, 121.414933);
    var mapProp = {
        center: new google.maps.LatLng(24.983952, 121.395933),
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"), mapProp);

    var marker = (type === 0) ? createMarker(officeLocation, "./img/star.png", null) : createMarker(officeLocation, "./img/star.png", "google.maps.Animation.BOUNCE");
    marker.setMap(map);

    var infowindow = new google.maps.InfoWindow({content: "<b>衛生所</b>"});
    if (type === 0) infowindow.open(map, marker);

    return map;
}

function process() {
    $("#progress").empty();
    $("#map").empty();

    map = initMap(1);

    names = [];
    errorNames = [];
    markers = [];
    infoWindows = [];

    /* read data from text area */
    var lines = null;
    if ($("#data").val() === "") {
        var examples = $("#data").attr("placeholder").split("\n");
        var exampleArr = [];
        for (var exampleIdx = 1; exampleIdx < examples.length; exampleIdx++) {
            exampleArr.push(examples[exampleIdx]);
        }

        lines = exampleArr;
    } else {
        lines = $("#data").val().split("\n");
    }

    console.log(`筆數 : ${lines.length}`);

    for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        setTimeout(processEach(lines[lineIdx], lines.length)(map, names, errorNames, markers, infoWindows), 100 + (lineIdx * 500));
    }
}

function processEach(element) {
    return function (map, names, errorNames, markers, infoWindows) {
        const name_level_address_line = element.split(",");
        const name = name_level_address_line[0];
        const level = name_level_address_line[1];
        const address = name_level_address_line[2];

        $.ajax({
            url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAj4PdVqJ5dptTNojTHop1tUsird2yxZgg`,
            method: "GET",
            cache: false,
            success: function (res) {
                if (res.status === "OK") {
                    var marker = createMarker(new google.maps.LatLng(res.results[0].geometry.location.lat, res.results[0].geometry.location.lng), level, null);

                    marker.setMap(map);

                    var infoWindow = new google.maps.InfoWindow({content: name});
                    infoWindow.open(map, marker);

                    names.push(name);
                    markers.push(marker);
                    infoWindows.push(infoWindow);
                } else {
                    console.error(`${address} parsing error : ${JSON.stringify(res)}`);

                    errorNames.push(name_level_address_line);
                }

                $("#progress").html(`已處理 ${names.length} 筆`);

                renderPage(names, errorNames);
            },
            error: function (xhr, status, error) {
                console.error(`${JSON.stringify(xhr)},\n${status},\n${error}`);
            }
        });
    };
}

function renderPage(nameArr, errorNameArr) {
    $("#checkBoxes").empty();
    $("#errorData").empty();

    var html = "", errHtml = "";
    for (var nameIdx = 0; nameIdx < nameArr.length; nameIdx++) {
        html += `<span><input id=\"idx${nameIdx}\" type=\"checkbox\" onclick=\"showAndHideMarker(${nameIdx})\" checked>${nameArr[nameIdx]}</span>`;
    }
    for (var errorNameIdx = 0; errorNameIdx < errorNameArr.length; errorNameIdx++) {
        if (errorNameIdx === 0) errHtml += "==地址解析錯誤 請修正原始檔==<br>";

        errHtml += `${errorNameArr[errorNameIdx]}<br>`;
    }

    $("#checkBoxes").html(html);
    $("#errorData").html(errHtml);
}

function createMarker(position, iconPath, animationType) {
    var marker = new google.maps.Marker();

    if (position) marker.setPosition(position);
    if (iconPath) {
        switch (iconPath) {
            case "一級":
                marker.setIcon("./img/1.png");
                break;
            case "二級":
                marker.setIcon("./img/2.png");
                break;
            case "三級":
                marker.setIcon("./img/3.png");
                break;
            case "四級":
                marker.setIcon("./img/4.png");
                break;
            default:
                marker.setIcon(iconPath);
                break;
        }
    }
    if (animationType) marker.setAnimation(eval(animationType));

    return marker;
}

function showAndHideMarker(index) {
    var isChecked = document.getElementById("idx" + index).checked;

    markers[index].setVisible(isChecked);

    if (isChecked) infoWindows[index].open(map, markers[index]);
    else infoWindows[index].close();
}