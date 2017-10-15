$(document).ready(function () {
    if(!navigator.userAgent.match(/Mac/i) && !window.location.pathname.match(/index/i)) {
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
        center: officeLocation,
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
        for (var i = 1; i < examples.length; i++) {
            exampleArr.push(examples[i]);
        }

        lines = exampleArr;
    } else {
        lines = $("#data").val().split("\n");
    }

    var processIdx = 0;
    lines.forEach(function (element) {
        var name_level_address_line = element.split(",");
        var name = name_level_address_line[0];
        var level = name_level_address_line[1];
        var address = name_level_address_line[2];

        $.ajax({
            url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAj4PdVqJ5dptTNojTHop1tUsird2yxZgg`,
            method: "GET",
            cache: false,
            success: function (res) {
                var marker = null;
                if (res.status === "OK") {
                    marker = createMarker(new google.maps.LatLng(res.results[0].geometry.location.lat, res.results[0].geometry.location.lng), level, null);

                    var infoWindow = new google.maps.InfoWindow({content: name});
                    infoWindow.open(map, marker);

                    marker.setMap(map);

                    names.push(name);
                    markers.push(marker);
                    infoWindows.push(infoWindow);
                } else {
                    console.error(`${address} parsing error : ${res}`);

                    errorNames.push(name_level_address_line);
                }

                $("#progress").html(`處理進度 : ${++processIdx} / ${lines.length}`);

                renderPage(names, errorNames);
            },
            error: function (xhr, status, error) {
                console.error(`${JSON.stringify(xhr)},\n${status},\n${error}`);
            }
        });
    });
}

function renderPage(nameArr, errorNameArr) {
    $("#checkBoxes").empty();
    $("#errorData").empty();

    var html = "", errHtml = "";
    for (var i = 0; i < nameArr.length; i++) {
        html += `<span><input id=\"idx${i}\" type=\"checkbox\" onclick=\"showAndHideMarker(${i})\" checked>${nameArr[i]}</span>`;
    }
    for (var i = 0; i < errorNameArr.length; i++) {
        if (i === 0) errHtml += "==地址解析錯誤 請修正原始檔==<br>";

        errHtml += `${errorNameArr[i]}<br>`;
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
    if (animationType) {
        marker.setAnimation(eval(animationType));
    }

    return marker;
}

function showAndHideMarker(index) {
    var isChecked = document.getElementById("idx" + index).checked;

    markers[index].setVisible(isChecked);

    if (isChecked) infoWindows[index].open(map, markers[index]);
    else infoWindows[index].close();
}