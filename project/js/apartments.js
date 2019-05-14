$(document).ready(function() {
    var $data,
        $data_shakh,
        $data_visual,
        SITE_TEMPLATE_PATH = 'https://gogolpark.ru/local/templates/gogolpark/',
        $shakhButton = $('#shakh_Link'),
        $visualButton = $('#apartments__visual'),
        $visualBackButton = $('#visual-back'),
        $main = $('.main'),
        filters = ['areaTo', 'areaFrom', 'floorTo', 'floorFrom', 'priceTo', 'priceFrom'],
        filterDefaults = {area: {from: 19, to: 113}, floor: {from: 2, to: 25}, price: {from: 1, to: 11} },
        isVisual = ($('.main').attr('data-content') === 'apartments-visual');



    /**
     * JQuery UI - Range Slider
     **/
    function rangeFilter(mainBlock, options, type) {
        $("#" + mainBlock + "From").val(options.min);
        $("#" + mainBlock + "To").val(options.max);

        mainBlock = "filter_" + mainBlock;

        var rangeBlock = $('#' + mainBlock + ' .range-block');
        var valueBlock_before = $('#' + mainBlock + ' .before');
        var valueBlock_after = $('#' + mainBlock + ' .after');

        rangeBlock.slider({
            range: true,
            min: options.min,
            max: options.max,
            values: [options.values.min, options.values.max],
            slide: function (event, ui) {
                if (type == "" || type == "html") {
                    $('#' + mainBlock + ' .range-block .ui-slider-handle:eq(0) .price-range-min').html(ui.values[0]);
                    $('#' + mainBlock + ' .range-block .ui-slider-handle:eq(1) .price-range-max').html(ui.values[1]);

                    $('#' + mainBlock + ' .input-field-l').val(ui.values[0]);
                    $('#' + mainBlock + ' .input-field-g').val(ui.values[1]);
                }
                else if (type == "input") {
                    valueBlock_before.val(ui.values[0]);
                    valueBlock_after.val(ui.values[1]);
                }
                $('[data-action=resetFilter]').show();
            },
            stop: function (event, ui) {
                filter();
                if ($('#scripts').length > 0 || $('#scripts-back').length > 0) {
                    visualFilter();
                }
            }
        });

        $("#" + mainBlock + ' .range-block .ui-slider-handle:eq(0)').append('<span class="price-range-min value">' + rangeBlock.slider('values', 0) + '</span>');
        $("#" + mainBlock + ' .range-block .ui-slider-handle:eq(1)').append('<span class="price-range-max value">' + rangeBlock.slider('values', 1) + '</span>');
    }

    $.each(filters, function(i, value){
        window[value] = (value === 'priceFrom' || value === 'priceTo') ? defineFilterElement(value, true) :  defineFilterElement(value);
    });

    function defineFilterElement(param, delimiter) {
        delimiter = typeof delimiter !== 'undefined' ? delimiter : false;
        value = filterDefaults[param.replace(/From|To/gi, '')][param.indexOf("From")>=0 ? "from" : "to"];
        return (typeof $.cookie(param) !== 'undefined' && $.cookie(param) !== "") ? (delimiter) ? Number($.cookie(param)) / 1000000 : Number($.cookie(param)) : value;
    }

    rangeFilter('area', {min: filterDefaults.area.from, max: filterDefaults.area.to, values: {min: areaFrom, max: areaTo}}, "");
    rangeFilter('floor', {min: filterDefaults.floor.from, max: filterDefaults.floor.to, values: {min: floorFrom, max: floorTo}}, "");
    rangeFilter('price', {min: filterDefaults.price.from, max: filterDefaults.price.to, values: {min: priceFrom, max: priceTo}}, "");


    function affix(idBlock, padding) {
        if (padding === '') padding = 50;
        if ($(window).width() > 768) {
            var block = $('#' + idBlock);
            if (block.length > 0) {
                block.affix({
                    offset: {
                        top: function() { },
                        bottom: function() { this.bottom = ($('footer').outerHeight(true) + padding) }
                    }
                })
            }
        }
    }

    var $affixBlocks = {'middleBlock': 50,'left-block': (window.location.pathname === '/apartments/' ? -100 : 50), 'visual-buttons': 10, 'house-buttons': 10};
    $.each($affixBlocks, function(selector, padding){
        affix(selector, padding);
    });

    $(window).resize(function () {
        if ($(window).width() > 768) affix('middleBlock');
        if ($(window).width() > 768) affix('left-block');
    });

    setTimeout(function() {
        $('#left-block').css('top',($(window).width() > 1024) ? '0' : '60px');
        $(window).resize(function(){
            $('#left-block').css('top',($(window).width() > 1024) ? '0' : '60px');
        })
    }, 300);



    $.fn.reverseChildren = function() {
        return this.each(function(){
            var $this = $(this);
            $this.children().each(function(){ $this.prepend(this) });
        });
    };
    $('#con').reverseChildren();

    var $footer = $('footer').clone();
    $('footer').remove();




    $.get("/apartments/?json=aparts").done(function(data) {
        $data = JSON.parse(data);
        initializeTable();
    });


    $visualBackButton.on('click', function(e) {
        e.preventDefault();
        var isFront = ($main.attr('data-content') === 'apartments-visual'),
            isBack = ($main.attr('data-content') === 'apartments-visual-back'),
            $jsSvgContainer = $('#js_svg_container'),
            $floorPlanImg = $('#floor_plan_img');

        $jsSvgContainer.css({"background-color": "rgba(16, 46, 106, 0.8)"});
        $main.attr('data-content', isFront ? 'apartments-visual-back' : (isBack ? 'apartments-visual' : ''));
        $floorPlanImg
            .fadeOut('fast')
            .attr('src', SITE_TEMPLATE_PATH + '/images/' + (isFront ? 'back_img' : (isBack ? 'header_face' : '')) + '.png')
            .fadeIn('fast');
        $('#floor_plan_svg').hide();
        setTimeout(function(){
            filterVisual();
        },200);

    });

    $(window).resize(function(){
        if (window.location.pathname === '/apartments-visual/') filterVisual();
    });

    function filterInput() {

        $('#hiddentable').hide();
        $(".checkbox-border").removeClass('checked');
        rooms = [];
        roomsCookie = [];
        layouts = [];
        layoutsCookie = [];

        $('.filter:checked').each(function () {
            $(this).parent().addClass('checked');
            rooms.push($(this).val());
            roomsCookie.push("'" + $(this).val() + "'");
        });

        $('.layout:checked').each(function () {
            layouts.push($(this).val());
            layoutsCookie.push("'" + $(this).val() + "'");
        });

        floorFrom = parseInt($('#floorFrom').val());
        floorTo = parseInt($('#floorTo').val());
        areaFrom = parseInt($('#areaFrom').val());
        areaTo = parseInt($('#areaTo').val());
        priceFrom = parseInt($('#priceFrom').val()) * 1000000;
        priceTo = parseInt($('#priceTo').val()) * 1000000;

        balcony = $('#filter_balcony').prop('checked') ? 1 :  0;
        kitchenover =  $('#filter_kitchenover').prop('checked') ? 1 :  0;

        var optionsPrice = $('#filter_price').find('.range-block').slider('option');
        var optionsFloor = $('#filter_floor').find('.range-block').slider('option');
        var optionsArea = $('#filter_area').find('.range-block').slider('option');

        if (
            ((parseInt(optionsPrice.min * 1000000) >= priceFrom) && (parseInt(optionsPrice.max * 1000000) <= priceTo)) &&
            ((parseInt(optionsFloor.min) >= floorFrom) && (parseInt(optionsFloor.max) <= floorTo)) &&
            ((parseInt(optionsArea.min) >= areaFrom) && (parseInt(optionsArea.max) <= areaTo)) &&
            (rooms.length == 0) &&
            (balcony == 0) &&
            (kitchenover == 0) &&
            (layouts.length == 0)
        ) {
            $('[data-action=resetFilter]').hide();
        }

        $.cookie('type', roomsCookie);
        $.cookie('layoutsType', layoutsCookie);
        $.cookie('floorFrom', floorFrom);
        $.cookie('floorTo', floorTo);
        $.cookie('areaFrom', areaFrom);
        $.cookie('areaTo', areaTo);
        $.cookie('priceFrom', priceFrom);
        $.cookie('priceTo', priceTo);
        $.cookie('balcony', balcony);
        $.cookie('kitchenover', kitchenover);
    }

    function filter() {
        var tableElem = $('.table-elem');
        filterInput();
        filterShakhTable(tableElem);
        if (isVisual) filterVisual();
    }

    if (window.location.pathname === '/apartments-visual/') {
        $main.attr('data-content','apartments-visual');
        var floorPlanIMG = $('#floor_plan_img');
        var left = $('#left-block');
        left.animate({backgroundColor: 'rgba(16,46,106,.8)'},100);
        /*
        if ($(window).width() > 768) {
            var width = floorPlanIMG.width();
            var height = floorPlanIMG.height();

            if ($(window).height() < height || height <= 0) {
                left.css({'height': '100vh'});
                $('.visual-block__buttons').css({'height': '15vh'});
                $('.filter-scroll').css({'height': 'calc(100vh - 176px)'});
            }
            else {
                left.css({'height': height});
                $('.visual-block__buttons').css({'height': '15vh'});
                $('.filter-scroll-2').css({'height': (height - 176)});
            }
            left.show();
        }

        $(window).resize(function () {
            width = floorPlanIMG.width();
            height = floorPlanIMG.height();

            if ($(window).width() > 768) {
                if ($(window).height() < height) {
                    left.css({'height': '100vh'});
                    $('.visual-block__buttons').css({'height': '15vh'});
                    $('.filter-scroll').css({'height': 'calc(100vh - 176px)'});
                }
                else {
                    left.css({'height': height});
                    $('.visual-block__buttons').css({'height': '15vh'});
                    $('.filter-scroll').css({'height': (height - 176)});
                }
                left.show();
            }
        });
        */
        if (!$data_visual) {
            $.each(['.rooms','#shakh_Block','#table_Block'], function(i, value){
                $(value).hide();
            });
            $('.left-block__title').html('Визуальный подбор');
            $('.preloader').addClass('active');
            $.get("/apartments/?json=visual").done(function(data) {
                $data_visual = JSON.parse(data);
                for (var section in $data_visual) {
                    for (var i = 1; i < 25;i++) {
                        if ($data_visual[section][i] === undefined)  $data_visual[section][i] = [];
                    }
                }
                initializeVisualTable('front',$data_visual);
                $('.preloader').removeClass('active');
                $('#house-buttons').show().addClass('affix');


                $('#js_svg_container').toggle();

            });
        } else {
            $('#house-buttons').toggle();
            $('.rooms').toggle();
            var jsVisibile = $('#js_svg_container:visible')[0];
            left.animate({backgroundColor: jsVisibile ? 'rgba(16,46,106)' : 'rgba(16,46,106,0.8)'}, 100)
            $('#shakh_Block').hide();
            $('#table_Block').toggle();
            $('#visual-buttons').show();
            $('#js_svg_container').toggle();
            caption = (jsVisibile) ?  'Визуальный подбор' : '<div>Подбор по параметрам</div>';
            captionIcon = (jsVisibile) ? 'icon-eye icon2' : 'icon-param icon3';
            $('.left-block__title').html(caption);
            $('#apartments__visual').html((jsVisibile? '<div>' : '<div>') + '<span class=" '+ captionIcon +'"></span>' + (!jsVisibile? '</div>' : '') + caption + (jsVisibile? '</div>' : ''));
        }

    }


    var $preloader = $('.preloader');

    if (window.location.pathname === '/apartments-chess/') {


        $.get("/apartments/?json=shakh").done(function(data) {
            $data_shakh = JSON.parse(data);
        }).done(function() {
            initializeShakhTable();
            $preloader.removeClass('active');
            $('#shakh_Block').show();
        })


    }

    function extend(obj, src) {
        Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
        return obj;
    }

    function filterVisual() {
        $('#floor_plan_svg').show();
        var params = {filtred: 0, side: 'front', data: null};
        var filterBuildSect = {};
        for (var sect in building) {
            var filterBuildFloor = {};
            for (var floor in building[sect]) {
                var filterBuildRoom = {};
                for (var room in building[sect][floor]) {
                    var element = building[sect][floor][room];
                    if (
                        ((parseInt(element['data_price']) >= priceFrom) && (parseInt(element['data_price']) <= priceTo)) &&
                        ((parseInt(element['data_floor']) >= floorFrom) && (parseInt(element['data_floor']) <= floorTo)) &&
                        ((parseInt(element['data_area']) >= areaFrom) && (parseInt(element['data_area']) <= areaTo)) &&
                        ((rooms.indexOf(element['data_rooms']) > -1) || (rooms.length == 0)) &&
                        ((parseInt(element['data_balcony']) == balcony) || (balcony == 0)) &&
                        ((parseInt(element['data_kitchenover']) == kitchenover) || (kitchenover == 0)) &&
                        ((layouts.indexOf(element['data_layout']) > -1) || (layouts.length == 0))
                    ) {
                        params.filtred = 1;
                        filterBuildRoom[room] = room;
                    }
                }
                filterBuildFloor[floor] = filterBuildRoom;
            }
            filterBuildSect[sect] = filterBuildFloor;
        }
        params.side = ($main.attr('data-content') === 'apartments-visual') ? 'front' : 'back';
        params.data = (params.filtred) ? filterBuildSect : $data_visual;
        initializeVisualTable(params.side , params.data);

    }

    function initializeVisualTable(side = "front", elements = {}) {

        $('#floor_plan_svg').html('');

        var data = {sections: null, buildings: null, style: null};

        $.when(
            $.getJSON(SITE_TEMPLATE_PATH + "/js/json/" + side + "/sections.json", function (sections) {
                data.sections = sections;
            }),
            $.getJSON(SITE_TEMPLATE_PATH + "/js/json/" + side + "/buildings.json", function (buildings) {
                data.buildings = buildings;
            }),
            $.getJSON(SITE_TEMPLATE_PATH + "/js/json/style.json", function(style) {
                data.style = style;
            })
        ).done(function(){

            ajaxBuild = elements;

            sections = data.sections;
            building = $data_visual;
            buildings = {};
            for (var floor in data.buildings) {
                var buildElement = {};
                var name =  data.buildings[floor]['name'];
                var section =  data.buildings[floor]['numsect'];
                for (var element in data.buildings[floor])
                    buildElement[element] = (element == 'free') ? Object.keys(ajaxBuild[section][name]).length : data.buildings[floor][element];
                buildings[floor] = buildElement;
            }


            /* apartments visual */

            var $jsSvgContainer = $('#js_svg_container'),
                $floorPlanImg = $('#floor_plan_img'),
                $floorPlan = $('#floor_plan_svg'),
                $left = $('#left-block'),
                $filterScroll = $('.filter-scroll'),
                $floorSvg = $('.floor-svg'),
                $buildingInfo = $('#building_info'),
                width = $floorPlanImg.width(),
                height = $floorPlanImg.height(),
                r = Raphael($floorPlan[0].id, width, height),
                arr_com = [];
            r.setViewBox(0, 0, 1098, 700).setSize(width, height);

            createElements(data.style.section);
            for (var floor in sections) {
                var free = sections[floor]['free'] > 0;
                var obj = r.path(sections[floor].path);
                obj.attr((free) ? def : def_sold);
                arr_com[obj.id] = floor;
                $('svg').css({'overflow': 'hidden', 'position': 'absolute'});
                var point = obj.getBBox(true);
            }
            createElements(data.style.apartment);
            r.setViewBox(0, 0, 1098, 700).setSize(width, height);
            arr_com = [];

            function blockAvailable(id) {
                return buildings[arr_com[id]]['free'] > 0;
            }

            for (var floor in buildings) {
                var obj = r.path(buildings[floor].path);

                (buildings[floor]['free'] > 0) ? obj.attr(def) :  obj.attr(def_sold);
                arr_com[obj.id] = floor;
                $('svg').css({'overflow': 'hidden', 'position': 'absolute'});
                var point = obj.getBBox(true);
                obj
                    .hover(function (event) {
                        this.attr(blockAvailable(this.id) ? hovered : hovered_sold);
                        $('.corpus_' + arr_com[this.id]).hide();
                    }, function (event) {
                        this.attr(blockAvailable(this.id) ? def : def_sold);
                        $('#building_info').stop().hide();
                        $('.corpus_' + arr_com[this.id]).show();
                    })
                    .mousemove(function (e) {
                        X = ($(window).width() > 1900) ? e.pageX - 360 : e.pageX - 250;
                        Y = e.pageY + 0;
                        if (blockAvailable(this.id)) {
                            var freeCount = 0, bronCount = 0, saledCount = 0;
                            (buildings[arr_com[this.id]]['free'].length == '') ? freeCount = 0 : freeCount = buildings[arr_com[this.id]]['free'];
                            (buildings[arr_com[this.id]]['bron'].length == '') ? bronCount = 0 : bronCount = buildings[arr_com[this.id]]['bron'];
                            (buildings[arr_com[this.id]]['saled'].length == '') ? saledCount = 0 : buildings[arr_com[this.id]]['saled'];
                            $buildingInfo.children().find('.mod__title').html(buildings[arr_com[this.id]]['name'] + ' Этаж');
                            $buildingInfo.children().find('.mod__desc').html(buildings[arr_com[this.id]]['numsect'] + ' Секция');
                            $buildingInfo.children().find('.insale__block').html(freeCount);
                            $buildingInfo.children().find('.bron__block').html(bronCount);
                            $buildingInfo.css({'top': Y, 'left': X }).stop().show();
                        }
                    })
                    .click(function (event) {
                        if (buildings[arr_com[this.id]]['free'] > 0) {
                            window.location = buildings[arr_com[this.id]]['url'];
                        }
                    });
            }

            $floorSvg.css({ "width": width, "height": height });
            $('.overlay').addClass('no-overlay');

            $left.css({ 'height': ($(window).height() < height || height <= 0) ? '100vh' : height }).show();
            $filterScroll.css({ 'height': ($(window).height() < height || height <= 0) ? 'calc(100vh - 176px)' : (height - 176)});
            $('.js-arrow').click(function(){
                if($(this).attr('data-exist') === 'yes')
                    window.location = $(this).attr('rel');
                return false;
            });
        });
    }

    function createElements(variables) {
        $.each(variables, function(name, value){
            window[name] = value;
        });
    }

    /*
     * Инициализация таблицы Шахматки после загрузки json
     */
    function initializeShakhTable() {
        var sections = 4,
            floors = 25,
            q = 150,
            amountofFlats = {1: 344, 2: 554, 3: 720}, // Отсчет от какой квартиры (не точный)
            amountOfFloors = {1: 6, 2: 8, 3: 9, 4: 7}, // Количество квартир на этаже
            amountOfIndex = {1: 13, 2: 17, 3: 19, 4: 15}, // Сколько пропускать квартир при счете cлева на право
            $roomBlock = $('#rooms-block'),
            $line,
            $apart,
            allowAppend;

        /*
         * Создание секция и нумерация этажей
         */
        for (var i = 0; i < sections; i++) {
            $roomBlock.append($('<div>', {class: 'swiper-slide'})
                .append($('<div>',{class: 'slide-block'})
                    .append($('<div>', {class: 'flex-block section__header'})
                        .append($('<div>', {class: 'section__title--shakh'})
                            .append('Секция ' + (i+1) )))));
        }

        /*
         * Добавление квартир в секции
         */
        $('.swiper-slide').each(function() {
            var $this = $(this);
            var korp = $this.index()+1;
            $this.append($('<div>', {class: "flex-block"})
                .append($('<div>', {class: 'section-floors'}))
                .append($('<div>').append($('<div>',{class: 'section-rooms'}))));
            for (var i = floors - 1 ; i > 0; i--) {
                q++;
                $this.find('.section-floors').append($('<span>' + (i+1) + '</span>'));
                $line = $('<div>', {class: 'table-line'}).append('</div>');
                $this.find('.section-rooms').append($line);
                q = (korp === 3 && i > 17) ? q - 18 : q-amountOfIndex[korp]; //фикс 3 корпуса и фикс нумерации квартир слева на право
                for (var n = 0; n < amountOfFloors[korp]; n++) {
                    q++;
                    allowAppend  = (korp === 3 && n > 7 && i > 17) ? 0 : 1; //Фикс 3 корпуса
                    var status = '';
                    var room = '';
                    var link = '';
                    if (allowAppend) {
                        var elem = $data_shakh[korp].filter(obj => { if (obj.data_number == q) return obj });
                        var apartment_info = (elem[0] && elem['data_bron'] !== "undefined") ? elem[0] : '';
                        link = ( apartment_info['href'] !== undefined && apartment_info['data_bron'] !== 'Продан') ? apartment_info['href'] : '';
                        status = (apartment_info['data_bron'] === 'Свободен'
                            && apartment_info['data_bron'] !== undefined)  ?
                            'free' : (apartment_info['data_bron'] === 'Бронь'
                                && apartment_info['data_bron'] !== undefined)  ?
                                'bron' : '';

                        room = (apartment_info['data_rooms'] !== undefined)  ? apartment_info['data_rooms'] : ' ';
                        $apart = $('<div>', {class: 'table-el'})
                            .append($('<div>', {class: 'table-element table-elem ' + (status ? status : ' sales')})
                                .attr({'data-balcony': 0,
                                    'data-rooms': room,
                                    'data-floor': i,
                                    'data-area': apartment_info['data_area'],
                                    'data-image': apartment_info['data_image'],
                                    'data-price': apartment_info['data_price'] ,
                                    'data-layout': '0',
                                    'data-kichenover': '0'})
                                .append($('<a ' + (link ? 'href="' + link  + '"': '')  +  '>')
                                    .append($('<p>' + room + '</p>'))))
                            .append('</a>');
                        $line.append($apart);
                    }
                }
                $line.append($('<div>', {class: 'clearfix'}))
            }


            q = amountofFlats[korp];
        });

        var $hoverBlock = $('#shakh__hover');

        $('.free').each(function () {

            $(this).hover(function(){
                    $hoverBlock.show();
                    $hoverBlock.find('img').attr('src',$(this).attr('data-image'));
                    $hoverBlock.find('.apart-hover-price').html($(this).attr('data-price').toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' <span class="rub__symbol">a</span>');
                },
                function () {
                    $hoverBlock.hide();

                })
        });
    }

    /*
     * Инициализация таблицы Шахматки после загрузки json
     */
    function initializeTable() {
        for (var i = 0; i < $data.length; i++) {
            var $apartment = $data[i],
                $item = $('<tr>',
                    {class: 'table-elem'})
                    .attr({
                        'data-balcony': $apartment['data_balcony'],
                        'data-href': $apartment['href'],
                        'data-rooms': $apartment['data_rooms'],
                        'data-floor': $apartment['data_floor'],
                        'data-area': $apartment['data_area'],
                        'data-price': $apartment['data_price'],
                        'data-layout': $apartment['data_layout'],
                        'data-kitchenover': $apartment['data_kitchenover'],
                    }).append('</tr>');
            var $index = {0: 'room',
                1: 'area',
                2: 'floor',
                3: 'section',
                4: 'number',
                5: 'balcony',
                6: 'kitchen',
                7: 'layout',
                8: 'price'};

            for (var n = 0; n < Object.keys($index).length; n++) {
                var $column = $('<td>' + $data[i]['columns'][$index[n]] + '</td>', {class: 'text-align_center'});
                //$column.addClass('header-table');
                if (n > 2 && !$index[n] !== 'price') $column.addClass('text-align_center');
                if ($index[n] === 'price') $column.addClass('text-align_right');
                $item.append($column);
            }

            $('tbody').append($item);
        }
        if ($("#apartTable")[0])
//            $("#apartTable").tablesorter({sortList: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [8, 0]]});
	    $("#apartTable").tablesorter({sortList: [[8, 0], [4, 0]]});
        if (window.location.pathname === '/apartments/') $('.preloader').removeClass('active');
        $('#content').after($footer);

        $('.table-elem[data-href]').on("click", function () {
            document.location = $(this).data('href');
        });
    }

    /**
     * Показать результаты
     **/
    var $hiddenTable = $('#hiddentable'),
        $showResult = $('#showResults');

    $showResult.on('click touch',function () {
        $hiddenTable.show();
        var top = $('#apartTable').offset().top - 65;
        $('body,html').animate({scrollTop: top}, 1500);
        return false;
    });

    var mobile;
    if (mobile) {
        [].forEach.call(document.querySelectorAll('img[data-src]'),    function(img) {
            img.setAttribute('src', img.getAttribute('data-src'));
            img.onload = function() {
                img.removeAttribute('data-src');
            };
        });
    }

    function FixTable(table) {
        var inst = this;
        this.table  = table;

        $('.fixtable-fixed').remove();
        $('.fixtable-relative').remove();

        $('tr > th',$(this.table)).each(function(index) {
            var div_fixed = $('<div/>').addClass('fixtable-fixed');
            var div_relat = $('<div/>').addClass('fixtable-relative');
            div_fixed.html($(this).html());
            div_relat.html();
            $(this).append(div_fixed).append(div_relat);
            $(div_fixed).hide();
        });

        this.StyleColumns();
        this.FixColumns();

        $(window).scroll(function(){
            inst.FixColumns()
        }).resize(function(){
            inst.StyleColumns()
        });
    }

    FixTable.prototype.StyleColumns = function() {
        var inst = this;
        $('tr > th', $(this.table)).each(function(){
            var div_relat = $('div.fixtable-relative', $(this));
            var th = $(div_relat).parent('th');
            var is1024 = ($(window).width() > 1024);
            $('div.fixtable-fixed', $(this)).css({
                'width': $(th).outerWidth(true) - parseInt($(th).css('border-left-width')) + 'px',
                'left': $(div_relat).offset().left - parseInt($(th).css('padding-left')) + 'px',
                'height': '55px',
                'padding-top': '0',
                'padding-left': (is1024) ? '0' : '10px',
                'padding-right': (is1024) ? '0' : '10px',
                'top': (is1024) ? 'unset' : '10px',
                'line-height': '55px',

            });
        });
    };

    FixTable.prototype.FixColumns = function() {
        var inst = this;
        var show = false;
        var s_top = $(window).scrollTop();
        var h_top = $(inst.table).offset().top;
        if (s_top < (h_top + $(inst.table).height() - $(inst.table).find('.fixtable-fixed').outerHeight()) && s_top > h_top) show = true;
        $('tr > th > div.fixtable-fixed', $(this.table)).each(function(){
            show ? $(this).show() : $(this).hide()
        });
    };

    $(window).load(function(){
        $('.table-fixed-mobile').each(function () {
            new FixTable(this);
        });
    });

    function filterCookieInput() {
        roomsCookie = [];
        rooms = [];
        layoutsCookie = [];
        layouts = [];

        if (typeof $.cookie('type') != 'undefined') {
            if($.cookie('type') != "") {
                roomsCookie = $.cookie('type').split(',');
                roomsCookie.forEach(function (type) {
                    type = type.replace(new RegExp("\x27+","g"), "");
                    $('#' + type).addClass('checked');
                    $('#' + type + ' .filter').prop('checked', true);
                    rooms.push(type);
                });
                $('[data-action=resetFilter]').show();
            }
        }
        else
            rooms = [];

        if (typeof $.cookie('layoutsType') != 'undefined') {
            if ($.cookie('layoutsType') != "") {
                layoutsCookie = $.cookie('layoutsType').split(',');
                layoutsCookie.forEach(function (type) {
                    type = type.replace(new RegExp("\x27+","g"), "");
                    $('[data-layout=' + type + ']').prop('checked', true);
                    layouts.push(type);
                });

                $('[data-action=resetFilter]').show();
            }
        }
        else
            layouts = [];

        $.each(['floorFrom', 'floorTo', 'areaFrom', 'areaTo', 'priceFrom', 'priceToo', 'balcony', 'kitchenover'], function(i, value) {
            if (typeof $.cookie(value) != 'undefined') {
                value = parseInt($.cookie(value));
                $('#' + value).val( (value == 'priceFrom' || value == 'priceToo') ? value / 1000000 : value);
                $('[data-action=resetFilter]').show();
            } else {
                value = parseInt($('#' + value).val() * (value == 'priceFrom' || value == 'priceToo') ? 1000000 : 1 );
            }


            if (value == 'balcony' || value == 'kitchenover') {
                if (typeof $.cookie(value) != 'undefined') {
                    if ($.cookie(value) == 1) {
                        $('#filter_' + value).prop('checked', true);
                        value = 1;
                    }
                    else {
                        $('#filter_' + value).prop('checked', false);
                        value = 0;
                    }
                    $('[data-action=resetFilter]').show();
                } else {
                    value = 0;
                }
            }
        });


        var optionsPrice = $('#filter_price').find('.range-block').slider('option');
        var optionsFloor = $('#filter_floor').find('.range-block').slider('option');
        var optionsArea = $('#filter_area').find('.range-block').slider('option');

        if (
            ((parseInt(optionsPrice.min * 1000000) >= priceFrom) && (parseInt(optionsPrice.max * 1000000) <= priceTo)) &&
            ((parseInt(optionsFloor.min) >= floorFrom) && (parseInt(optionsFloor.max) <= floorTo)) &&
            ((parseInt(optionsArea.min) >= areaFrom) && (parseInt(optionsArea.max) <= areaTo)) &&
            (rooms.length == 0) &&
            (balcony == 0) &&
            (kitchenover == 0) &&
            (layouts.length == 0)
        ) {
            $('[data-action=resetFilter]').hide();
        }
    }



    function visualCookieFilter() {
        filterCookieInput();
        if (isVisual) filterVisual();
    }

    if ($('#scripts').length > 0 || $('#scripts-back').length > 0) {
        if (isVisual)  visualCookieFilter();
    }

    function visualFilter() {
        filterInput();
        if (isVisual) filterVisual();
    }


    /**
     * Фильтр для таблицы и шахматки
     **/

    function filterShakhTable(tableElem) {
        tableElem.hide();
        tableElem.parent().addClass('no-hover');
        tableElem.each(function (index) {
            if (
                ((parseInt($(this).attr('data-price')) >= priceFrom) && (parseInt($(this).attr('data-price')) <= priceTo)) &&
                ((parseInt($(this).attr('data-floor')) >= floorFrom) && (parseInt($(this).attr('data-floor')) <= floorTo)) &&
                ((parseInt($(this).attr('data-area')) >= areaFrom) && (parseInt($(this).attr('data-area')) <= areaTo)) &&
                ((rooms.indexOf($(this).attr('data-rooms')) > -1) || (rooms.length == 0)) &&
                ((parseInt($(this).attr('data-balcony')) == balcony) || (balcony == 0)) &&
                ((parseInt($(this).attr('data-kitchenover')) == kitchenover) || (kitchenover == 0)) &&
                ((layouts.indexOf($(this).attr('data-layout')) > -1) || (layouts.length == 0))
            ) {
                $(this).show();
                $(this).parent().removeClass('no-hover');
            }
        });
    }


    function filterCookie() {
        var tableElem = $('.table-elem');
        filterCookieInput();
        filterShakhTable(tableElem);
    }

    if ($('[data-content=apartments]').length > 0) {
        filterCookie();
    }

    $.each(['layout','balcony','kitchenover','filter'], function(index, value) {
        $("." + value).on("change", function () {
            $('[data-action=resetFilter]').show();
            filter();
        });

        $(".left-block-visual ." + value).on("change", function () {
            $('[data-action=resetFilter]').show();
            visualFilter();
        });
    });



    // Сбросить фильтр
    $('[data-action=resetFilter]').click(function() {
        $('.checkbox-border').removeClass('checked');
        $('.filter-control[type=checkbox]').prop('checked', false);

        $('.filter').each(function(){
            var options = $(this).find('.range-block').slider('option');
            $(this).find('.range-block').slider('values', [options.min, options.max]);
            $(this).find(".price-range-min").text(options.min);
            $(this).find(".price-range-max").text(options.max);
            $(this).find(".input-field-l").val(options.min);
            $(this).find(".input-field-g").val(options.max);
        });

        if ($('[data-content=apartments-visual]').length > 0) {
            visualFilter();
        }
        if ($('[data-content=apartments]').length > 0) {
            visualFilter();
            filter();
        }

        $.each(['floorFrom','floorTo','areaFrom','areaTo','priceFrom','priceTo','type','layoutsType','balcony','kitchenover'], function(index, value) {
            $.removeCookie(value);
        });

        $(this).hide();
    });
});

$(document).on('mousemove','.table-el > .free',function(e){
    $('#shakh__hover').css({'top': e.pageY + 20, 'left':e.pageX + 20 ,'position': 'absolute'});
});

function loadDoc() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     document.getElementById("demo").innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", "ajax_info.txt", true);
  xhttp.send();
}