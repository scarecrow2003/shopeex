let codes = [];

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
        dataType: "json",
        success: function(result) {
            codes = result.split(",");
            $('#headingTwo').click();
        }
    });
}

function showSuggestion(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        let query = $("#query").value;
        if (query) {
            let suggestion = [];
            for (let i = 0; i < codes.length; i++) {
                if (codes[i].indexOf(query, codes[i].length - query.length) !== -1) {
                    suggestion.push(codes[i]);
                //    display list of suggestions
                }
            }
            if (suggestion.length === 1) {
                // display photo
            }
        }
    }
}

function displayPhoto(code) {

}