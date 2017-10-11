$(document).ready(function () {
    if(!navigator.userAgent.match(/Mac/i) && !window.location.pathname.match(/index/i)) {
         window.location = "./index.html";
    }

    initMap(0);
});

var map = null;
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
    markers = [];
    infoWindows = [];
    $("#map").empty();
    $("#check").empty();
    $("#error").empty();

    /* read data from text area */
    var lines = null;
    if ($("#data").val() === "") {
        lines = $("#data").attr("placeholder").split("\n");
        delete lines[0];
    } else {
        lines = $("#data").val().split("\n");
    }

    var data = [];
    var errAddr = [];
    lines.forEach(function (element) {
        var name_address_level = element.split(",");
        var tmpLocation = address2latlng(name_address_level[2]);

        if (tmpLocation.lat === 24.983952 && tmpLocation.lng === 121.414933) {
            errAddr.push(element);
        }

        data.push({
            name: name_address_level[0],
            location: tmpLocation,
            level: name_address_level[1]
        });
    });

    map = initMap(1);

    var html = "";
    for (var i = 0; i < data.length; i++) {
        if (data[i].location === null) return;

        var latlng = new google.maps.LatLng(data[i].location.lat, data[i].location.lng);
        var marker = createMarker(latlng, data[i].level, null);
        marker.setMap(map);
        markers.push(marker);

        var infoWindow = new google.maps.InfoWindow({content: data[i].name});
        infoWindow.open(map, marker);
        infoWindows.push(infoWindow);

        html += "<span><input id=\"idx" + i + "\" type=\"checkbox\" onclick=\"showAndHideMarker(" + i + ")\" checked>" + data[i].name + "</span>";
    }

    for (var i = 0; i < errAddr.length; i++) {
        if (i === 0) errHtml.append("==地址解析錯誤 請修正原始檔==");

        errHtml += `${errAddr[i]}<br>`;
    }

    $("#check").append(html);
    $("#error").append(errHtml);
}

function address2latlng(address) {
    var latlng = null;

    $.ajax({
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAj4PdVqJ5dptTNojTHop1tUsird2yxZgg`,
        method: "GET",
        async: false,
        success: function (res) {
            if (res.results.length > 0) {
                latlng = {lat: res.results[0].geometry.location.lat, lng: res.results[0].geometry.location.lng};
            } else {
                latlng = {lat: 24.983952, lng: 121.414933};
                console.error(`${address} parsing error : ${res}`);
            }
        },
        error: function (xhr, status, error) {
            console.error(`${JSON.stringify(xhr)},\n${status},\n${error}`);
        }
    });

    return latlng;
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