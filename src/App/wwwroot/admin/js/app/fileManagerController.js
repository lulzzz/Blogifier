﻿var fileManagerController = function (dataService) {
    var callBack;

    function open(openCallback) {
        $('#fileManager').modal();
        load(1);
        callBack = openCallback;
    }

    function close() {
        $('#fileManager').modal('hide');
    }

    function pick(id) {
        var items = $('.bf-filemanager .item-check:checked');
        if (callBack.name === 'insertImageCallback') {
            if (id === 0) {
                for (i = 0; i < items.length; i++) {
                    dataService.get('assets/single/' + items[i].id, callBack, fail);
                }
            }
            else {
                dataService.get('assets/single/' + id, callBack, fail);
            }
        }
        else {
            if (id === 0) {
                if (items.length === 0) {
                    toastr.error('Please select an item');
                }
                else {
                    id = items[0].id;
                }
            }
            var url = 'assets/' + id;
            if (callBack.name === 'updatePostCoverCallback') {
                url = 'assets/pick?type=postCover&asset=' + id + '&post=' + $('#Id').val();
            }
            else if (callBack.name === 'updateAppCoverCallback') {
                url = 'assets/pick?type=appCover&asset=' + id;
            }
            else if (callBack.name === 'updateAppLogoCallback') {
                url = 'assets/pick?type=appLogo&asset=' + id;
            }
            else if(callBack.name === 'updateAvatarCallback'){
                url = 'assets/pick?type=avatar&asset=' + id; 
            }
            dataService.get(url, callBack, fail);
        }
        close();
    }

    function uploadClick() {
        $('#files').trigger('click');
        return false;
    }
    function uploadSubmit() {
        var data = new FormData($('#frmUpload')[0]);

        dataService.upload('assets/upload', data, submitCallback, fail);
    }
    function submitCallback() {
        load(1);
    }

    function remove() {
        loading();
        var items = $('#fileManagerList input:checked');
        for (i = 0; i < items.length; i++) {
            if (i + 1 < items.length) {
                dataService.remove('assets/remove/' + items[i].id, emptyCallback, fail);
            }
            else {
                dataService.remove('assets/remove/' + items[i].id, removeCallback, fail);
            }
        }
    }
    function removeCallback(data) {
        loaded();
        toastr.success('Deleted');
        load(1);
    }

    function load(page) {
        $('#check-all').prop('checked', false);
        var filter = $('input[name=filter]:checked').val();
        if (!filter) {
            filter = 'filterAll';
        }
        var search = $('#asset-search').val();
        if (search && search.length > 0) {
            dataService.get('assets?page=' + page + '&filter=' + filter + '&search=' + search, loadCallback, fail);
        }
        else {
            dataService.get('assets?page=' + page + '&filter=' + filter, loadCallback, fail);
        }
        return false;
    }
    function loadCallback(data) {
        $('#fileManagerList').empty();
        var assets = data.assets;
        $.each(assets, function (index) {
            var asset = assets[index];
            var src = asset.assetType === 0 ? webRoot + asset.url : webRoot + asset.image;
            var tag = '<div class="col-sm-6 col-md-4 col-lg-3">' +
                '	<div class="item">' +
                '		<div class="item-img" onclick="fileManagerController.pick(' + asset.id + '); return false"><img src="' + src + '" alt="' + asset.title + '" /></div>' +
                '		<label class="custom-control custom-checkbox item-name">' +
                '			<input type="checkbox" id="' + asset.id + '" class="custom-control-input item-check" onchange="fileManagerController.check(this)">' +
                '			<span class="custom-control-label">' + asset.title + '</span>' +
                '		</label>' +
                '	</div>' +
                '</div>';
            $("#fileManagerList").append(tag);
        });
        loadPager(data.pager);
    }
    function loadPager(pg) {
        $('#file-pagination').empty();

        var last = pg.currentPage * pg.itemsPerPage;
        var first = pg.currentPage === 1 ? 1 : ((pg.currentPage - 1) * pg.itemsPerPage) + 1;
        if (last > pg.total) { last = pg.total; }

        var pager = "";

        if (pg.showOlder === true) {
            pager += '<button type="button" class="btn btn-sm btn-link" onclick="return fileManagerController.load(' + pg.older + ')"><i class="fa fa-chevron-left"></i></button>';
        }
        pager += '<span class="bf-filemanager-pagination">' + first + '-' + last + ' out of ' + pg.total + '</span>';
        if (pg.showNewer === true) {
            pager += '<button type="button" class="btn btn-sm btn-link" onclick="return fileManagerController.load(' + pg.newer + ')"><i class="fa fa-chevron-right"></i></button>';
        }


        $('#file-pagination').append(pager);
        showBtns();
    }

    function loading() {
        $('#btnDelete').hide();
        $('.loading').fadeIn();
    }
    function loaded() {
        $('.loading').hide();
    }

    function emptyCallback(data) { }
    function fail() {
        toastr.error('Failed');
    }

    function check(cbx) {
        if (!cbx.checked) {
            $('#check-all').prop('checked', false);
        }
        showBtns();
    }
    function showBtns() {
        var items = $('.bf-filemanager .item-check:checked');
        if (items.length > 0) {
            $('#btnDelete').show();
            $('#btnSelect').show();
        }
        else {
            $('#btnDelete').hide();
            $('#btnSelect').hide();
        }
    }

    return {
        open: open,
        load: load,
        close: close,
        pick: pick,
        uploadClick: uploadClick,
        uploadSubmit: uploadSubmit,
        remove: remove,
        check: check,
        showBtns: showBtns
    }
}(DataService);

$('#asset-search').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        fileManagerController.load(1);
        return false;
    }
});

$('.bf-posts-list .item-link-desktop').click(function () {
    $('.bf-posts-list .item-link-desktop').removeClass('active');
    $(this).addClass('active');
});

// check all
var itemCheckfm = $('.bf-filemanager .item-check');
var firstItemCheckfm = itemCheckfm.first();

$(firstItemCheckfm).on('change', function () {
    var itemCheckfm = $('.bf-filemanager .item-check');
    $(itemCheckfm).prop('checked', this.checked);
    fileManagerController.showBtns();
});

// callbacks
var updateAvatarCallback = function (data) {
    $('#Avatar').val(data.url);
    toastr.success('Updated');
}
var updateAppCoverCallback = function (data) {
    $('#Cover').val(data.url);
    toastr.success('Updated');
}
var updateAppLogoCallback = function (data) {
    $('#Logo').val(data.url);
    toastr.success('Updated');
}