let codes = new Map();

function loadPhotos() {
    $("#loadPhoto").hide();
    $.ajax({
        url: '/app/load',
        success: function(result) {
            let resArr = result.split(",");
            let html = '';
            for (let i=0; i<resArr.length; i += 2) {
                let checked = "";
                if (resArr[i+1] === "true") {
                    checked = "checked";
                }
                html += '<div class="col-md-3"><div class="custom-control custom-checkbox image-checkbox"><input type="checkbox" class="custom-control-input" id="' + resArr[i] + '" ' + checked + '><label class="custom-control-label" for="' + resArr[i] + '"><img src="/placeholder/' + resArr[i] + '" alt="#" class="img-fluid"></label></div></div>';
            }
            $("#photos-list").replaceWith(html);
            $("#photos").show();
        }
    });
}

function confirmQrCode() {
    let checkboxes = $.find(':checkbox');
    let checked = [];
    for (let i=0; i<checkboxes.length; i++) {
        if ($(checkboxes[i]).is(':checked')) {
            checked.push(checkboxes[i].id);
        }
    }
    let formData = {
        photos: checked.join(",")
    }
    $.ajax({
        url: '/app/confirm',
        type: 'POST',
        data: formData,
        dataType: "JSON",
        success: function(result) {
            for (let i=0; i<result.length; i++) {
                let one = result[i]
                for (let j=0; j<one.length; j++) {
                    codes.set(one[j], one);
                }
            }
            $('#collapseTwo').collapse("toggle");
        }
    });
}

function showSuggestion(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        let query = $("#query").val();
        if (query) {
            let suggestion = [];
            codes.forEach(function(value, key) {
                if (key.indexOf(query, key.length - query.length - 1) !== -1) {
                    suggestion.push(key);
                }
            });
            if (suggestion.length > 0) {
                if (suggestion.length === 1) {
                    $("#suggestion-list").html("");
                    displayPhoto(codes.get(suggestion[0]));
                } else {
                    displaySuggestion(suggestion);
                    $("#suggestion-photos").html("");
                }
            } else {
                $("#suggestion-list").html("Not found");
                $("#suggestion-photos").html("");
            }
        } else {
            $("#suggestion-list").html("");
            $("#suggestion-photos").html("");
        }
        $(this).focus(function() {
            $(this).select();
        });
    }
}

function displayPhotoList(list) {
    let codes = list.split(',');
    displayPhoto(codes);
}

function displayPhoto(codes) {
    let fileNames = []
    let html = '<div class="row">';
    let today = formattedToday();
    if (codes.length > 0) {
        for (let i=0; i<codes.length; i++) {
            let photo = codes[i].trim();
            fileNames.push(photo);
        }
    }
    let code = codes[codes.length - 1].trim();
    fileNames.push(code + '-1');
    fileNames.push(code + '-2');
    for (let j=0; j<fileNames.length; j++) {
        html += '<div class="col-md-4"><img src="/final/' + today + '/' + fileNames[j] + '.jpg" alt="#" class="img-fluid"></div>';
    }
    html += '</div>';
    $("#suggestion-photos").html(html);
}

function displaySuggestion(suggestion) {
    let html = '<div class="row">';
    for (let i=0; i<suggestion.length; i++) {
        let photos = '';
        let val = codes.get(suggestion[i]);
        for (let j = 0; j<val.length; j++) {
            photos += val[j];
            if (j !== val.length - 1) {
                photos += ',';
            }
        }
        html += '<div class="col-md-3"><button type="button" class="btn btn-primary btn-lg" onclick="displayPhotoList(\'' + photos + '\')">' + suggestion[i] + '</button></div>';
    }
    html += '</div>';
    $("#suggestion-list").html(html);
}

function formattedToday() {
    const today = new Date(Date.now());
    let result = "" + today.getFullYear();
    const month = today.getMonth() + 1;
    result += (month >= 10 ? "" : "0") + month;
    const date = today.getDate();
    result += (date >= 10 ? "" : "0") + date;
    return result;
}

function selectAll() {
    $(this).select();
}