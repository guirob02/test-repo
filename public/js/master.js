var Master = function () {
    // Helper variables - set in uiInit()
    var $lHtml, $lBody, $lPage, $lSidebar, $lSidebarScroll, $lSideOverlay, $lSideOverlayScroll, $lHeader, $lMain, $lFooter;

    // User Interface init
    var uiInit = function () {
        // Set variables
        $lHtml = jQuery('html');
        $lBody = jQuery('body');
        $lPage = jQuery('#page-container');
        $lSidebar = jQuery('#sidebar');
        $lSidebarScroll = jQuery('#sidebar-scroll');
        $lSideOverlay = jQuery('#side-overlay');
        $lSideOverlayScroll = jQuery('#side-overlay-scroll');
        $lHeader = jQuery('#header-navbar');
        $lMain = jQuery('#main-container');
        $lFooter = jQuery('#page-footer');

        // Initialize Tooltips
        jQuery('[data-toggle="tooltip"], .js-tooltip').tooltip({
            container: 'body',
            animation: false
        });

        // Initialize Popovers
        jQuery('[data-toggle="popover"], .js-popover').popover({
            container: 'body',
            animation: true,
            trigger: 'hover'
        });

        // Initialize Tabs
        jQuery('[data-toggle="tabs"] a, .js-tabs a').click(function (e) {
            e.preventDefault();
            jQuery(this).tab('show');
        });

        // Init form placeholder (for IE9)
        jQuery('.form-control').placeholder();
    };

    // Layout functionality
    var uiLayout = function () {
        // Resizes #main-container min height (push footer to the bottom)
        var $resizeTimeout;

        if ($lMain.length) {
            uiHandleMain();

            jQuery(window).on('resize orientationchange', function () {
                clearTimeout($resizeTimeout);

                $resizeTimeout = setTimeout(function () {
                    uiHandleMain();
                }, 150);
            });
        }

        // Init sidebar and side overlay custom scrolling
        uiHandleScroll('init');

        // Init transparent header functionality (solid on scroll - used in frontend)
        if ($lPage.hasClass('header-navbar-fixed') && $lPage.hasClass('header-navbar-transparent')) {
            jQuery(window).on('scroll', function () {
                if (jQuery(this).scrollTop() > 20) {
                    $lPage.addClass('header-navbar-scroll');
                } else {
                    $lPage.removeClass('header-navbar-scroll');
                }
            });
        }

        // Call layout API on button click
        jQuery('[data-toggle="layout"]').on('click', function () {
            var $btn = jQuery(this);

            uiLayoutApi($btn.data('action'));

            if ($lHtml.hasClass('no-focus')) {
                $btn.blur();
            }
        });
    };

    // Resizes #main-container to fill empty space if exists
    var uiHandleMain = function () {
        var $hWindow = jQuery(window).height();
        var $hHeader = $lHeader.outerHeight();
        var $hFooter = $lFooter.outerHeight();

        if ($lPage.hasClass('header-navbar-fixed')) {
            $lMain.css('min-height', $hWindow - $hFooter);
        } else {
            $lMain.css('min-height', $hWindow - ($hHeader + $hFooter));
        }
    };

    // Handles sidebar and side overlay custom scrolling functionality
    var uiHandleScroll = function ($mode) {
        var $windowW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        // Init scrolling
        if ($mode === 'init') {
            // Init scrolling only if required the first time
            uiHandleScroll();

            // Handle scrolling on resize or orientation change
            var $sScrollTimeout;

            jQuery(window).on('resize orientationchange', function () {
                clearTimeout($sScrollTimeout);

                $sScrollTimeout = setTimeout(function () {
                    uiHandleScroll();
                }, 150);
            });
        } else {
            // If screen width is greater than 991 pixels and .side-scroll is added to #page-container
            if ($windowW > 991 && $lPage.hasClass('side-scroll')) {
                // Turn scroll lock off (sidebar and side overlay - slimScroll will take care of it)
                jQuery($lSidebar).scrollLock('off');
                jQuery($lSideOverlay).scrollLock('off');

                // If sidebar scrolling does not exist init it..
                if ($lSidebarScroll.length && (!$lSidebarScroll.parent('.slimScrollDiv').length)) {
                    $lSidebarScroll.slimScroll({
                        height: $lSidebar.outerHeight(),
                        color: '#fff',
                        size: '5px',
                        opacity: .35,
                        wheelStep: 15,
                        distance: '2px',
                        railVisible: false,
                        railOpacity: 1
                    });
                } else { // ..else resize scrolling height
                    $lSidebarScroll
                        .add($lSidebarScroll.parent())
                        .css('height', $lSidebar.outerHeight());
                }

                // If side overlay scrolling does not exist init it..
                if ($lSideOverlayScroll.length && (!$lSideOverlayScroll.parent('.slimScrollDiv').length)) {
                    $lSideOverlayScroll.slimScroll({
                        height: $lSideOverlay.outerHeight(),
                        color: '#000',
                        size: '5px',
                        opacity: .35,
                        wheelStep: 15,
                        distance: '2px',
                        railVisible: false,
                        railOpacity: 1
                    });
                } else { // ..else resize scrolling height
                    $lSideOverlayScroll
                        .add($lSideOverlayScroll.parent())
                        .css('height', $lSideOverlay.outerHeight());
                }
            } else {
                // Turn scroll lock on (sidebar and side overlay)
                jQuery($lSidebar).scrollLock();
                jQuery($lSideOverlay).scrollLock();

                // If sidebar scrolling exists destroy it..
                if ($lSidebarScroll.length && $lSidebarScroll.parent('.slimScrollDiv').length) {
                    $lSidebarScroll
                        .slimScroll({
                            destroy: true
                        });
                    $lSidebarScroll
                        .attr('style', '');
                }

                // If side overlay scrolling exists destroy it..
                if ($lSideOverlayScroll.length && $lSideOverlayScroll.parent('.slimScrollDiv').length) {
                    $lSideOverlayScroll
                        .slimScroll({
                            destroy: true
                        });
                    $lSideOverlayScroll
                        .attr('style', '');
                }
            }
        }
    };

    // Layout API
    var uiLayoutApi = function ($mode) {
        var $windowW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        // Mode selection
        switch ($mode) {
            case 'sidebar_pos_toggle':
                $lPage.toggleClass('sidebar-l sidebar-r');
                break;
            case 'sidebar_pos_left':
                $lPage
                    .removeClass('sidebar-r')
                    .addClass('sidebar-l');
                break;
            case 'sidebar_pos_right':
                $lPage
                    .removeClass('sidebar-l')
                    .addClass('sidebar-r');
                break;
            case 'sidebar_toggle':
                if ($windowW > 991) {
                    $lPage.toggleClass('sidebar-o');
                } else {
                    $lPage.toggleClass('sidebar-o-xs');
                }
                break;
            case 'sidebar_open':
                if ($windowW > 991) {
                    $lPage.addClass('sidebar-o');
                } else {
                    $lPage.addClass('sidebar-o-xs');
                }
                break;
            case 'sidebar_close':
                if ($windowW > 991) {
                    $lPage.removeClass('sidebar-o');
                } else {
                    $lPage.removeClass('sidebar-o-xs');
                }
                break;
            case 'sidebar_mini_toggle':
                if ($windowW > 991) {
                    $lPage.toggleClass('sidebar-mini');
                }
                break;
            case 'sidebar_mini_on':
                if ($windowW > 991) {
                    $lPage.addClass('sidebar-mini');
                }
                break;
            case 'sidebar_mini_off':
                if ($windowW > 991) {
                    $lPage.removeClass('sidebar-mini');
                }
                break;
            case 'side_overlay_toggle':
                $lPage.toggleClass('side-overlay-o');
                break;
            case 'side_overlay_open':
                $lPage.addClass('side-overlay-o');
                break;
            case 'side_overlay_close':
                $lPage.removeClass('side-overlay-o');
                break;
            case 'side_overlay_hoverable_toggle':
                $lPage.toggleClass('side-overlay-hover');
                break;
            case 'side_overlay_hoverable_on':
                $lPage.addClass('side-overlay-hover');
                break;
            case 'side_overlay_hoverable_off':
                $lPage.removeClass('side-overlay-hover');
                break;
            case 'header_fixed_toggle':
                $lPage.toggleClass('header-navbar-fixed');
                break;
            case 'header_fixed_on':
                $lPage.addClass('header-navbar-fixed');
                break;
            case 'header_fixed_off':
                $lPage.removeClass('header-navbar-fixed');
                break;
            case 'side_scroll_toggle':
                $lPage.toggleClass('side-scroll');
                uiHandleScroll();
                break;
            case 'side_scroll_on':
                $lPage.addClass('side-scroll');
                uiHandleScroll();
                break;
            case 'side_scroll_off':
                $lPage.removeClass('side-scroll');
                uiHandleScroll();
                break;
            default:
                return false;
        }
    };

    // Main navigation functionality
    var uiNav = function () {
        // When a submenu link is clicked
        jQuery('[data-toggle="nav-submenu"]').on('click', function (e) {
            // Stop default behaviour
            e.stopPropagation();

            // Get link
            var $link = jQuery(this);

            // Get link's parent
            var $parentLi = $link.parent('li');

            if ($parentLi.hasClass('open')) { // If submenu is open, close it..
                $parentLi.removeClass('open');
            } else { // .. else if submenu is closed, close all other (same level) submenus first before open it
                $link
                    .closest('ul')
                    .find('> li')
                    .removeClass('open');

                $parentLi
                    .addClass('open');
            }

            // Remove focus from submenu link
            if ($lHtml.hasClass('no-focus')) {
                $link.blur();
            }
        });
    };

    // Blocks options functionality
    var uiBlocks = function () {
        // Init default icons fullscreen and content toggle buttons
        uiBlocksApi(false, 'init');

        // Call blocks API on option button click
        jQuery('[data-toggle="block-option"]').on('click', function () {
            uiBlocksApi(jQuery(this).parents('.block'), jQuery(this).data('action'));
        });
    };

    // Blocks API
    var uiBlocksApi = function ($block, $mode) {
        var $iconFullscreen = 'si si-size-fullscreen';
        var $iconFullscreenActive = 'si si-size-actual';
        var $iconContent = 'si si-arrow-up';
        var $iconContentActive = 'si si-arrow-down';

        if ($mode === 'init') {
            jQuery('[data-toggle="block-option"][data-action="fullscreen_toggle"]').each(function () {
                var $this = jQuery(this);

                $this.html('<i class="' + (jQuery(this).closest('.block').hasClass('block-opt-fullscreen') ? $iconFullscreenActive : $iconFullscreen) + '"></i>');
            });

            jQuery('[data-toggle="block-option"][data-action="content_toggle"]').each(function () {
                var $this = jQuery(this);

                $this.html('<i class="' + ($this.closest('.block').hasClass('block-opt-hidden') ? $iconContentActive : $iconContent) + '"></i>');
            });
        } else {
            var $elBlock = ($block instanceof jQuery) ? $block : jQuery($block);

            if ($elBlock.length) {
                var $btnFullscreen = jQuery('[data-toggle="block-option"][data-action="fullscreen_toggle"]', $elBlock);
                var $btnToggle = jQuery('[data-toggle="block-option"][data-action="content_toggle"]', $elBlock);

                // Mode selection
                switch ($mode) {
                    case 'fullscreen_toggle':
                        $elBlock.toggleClass('block-opt-fullscreen');

                        // Enable/disable scroll lock to block
                        $elBlock.hasClass('block-opt-fullscreen') ? jQuery($elBlock).scrollLock() : jQuery($elBlock).scrollLock('off');

                        // Update block option icon
                        if ($btnFullscreen.length) {
                            if ($elBlock.hasClass('block-opt-fullscreen')) {
                                jQuery('i', $btnFullscreen)
                                    .removeClass($iconFullscreen)
                                    .addClass($iconFullscreenActive);
                            } else {
                                jQuery('i', $btnFullscreen)
                                    .removeClass($iconFullscreenActive)
                                    .addClass($iconFullscreen);
                            }
                        }
                        break;
                    case 'fullscreen_on':
                        $elBlock.addClass('block-opt-fullscreen');
                        jQuery($elBlock).scrollLock();

                        if ($btnFullscreen.length) {
                            jQuery('i', $btnFullscreen)
                                .removeClass($iconFullscreen)
                                .addClass($iconFullscreenActive);
                        }
                        break;
                    case 'fullscreen_off':
                        $elBlock.removeClass('block-opt-fullscreen');

                        // Disable scroll lock to block
                        jQuery($elBlock).scrollLock('off');

                        // Update block option icon
                        if ($btnFullscreen.length) {
                            jQuery('i', $btnFullscreen)
                                .removeClass($iconFullscreenActive)
                                .addClass($iconFullscreen);
                        }
                        break;
                    case 'content_toggle':
                        $elBlock.toggleClass('block-opt-hidden');

                        // Update block option icon
                        if ($btnToggle.length) {
                            if ($elBlock.hasClass('block-opt-hidden')) {
                                jQuery('i', $btnToggle)
                                    .removeClass($iconContent)
                                    .addClass($iconContentActive);
                            } else {
                                jQuery('i', $btnToggle)
                                    .removeClass($iconContentActive)
                                    .addClass($iconContent);
                            }
                        }
                        break;
                    case 'content_hide':
                        $elBlock.addClass('block-opt-hidden');

                        // Update block option icon
                        if ($btnToggle.length) {
                            jQuery('i', $btnToggle)
                                .removeClass($iconContent)
                                .addClass($iconContentActive);
                        }
                        break;
                    case 'content_show':
                        $elBlock.removeClass('block-opt-hidden');

                        // Update block option icon
                        if ($btnToggle.length) {
                            jQuery('i', $btnToggle)
                                .removeClass($iconContentActive)
                                .addClass($iconContent);
                        }
                        break;
                    case 'refresh_toggle':
                        $elBlock.toggleClass('block-opt-refresh');

                        if (jQuery('[data-toggle="block-option"][data-action="refresh_toggle"][data-action-mode="demo"]', $elBlock).length) {
                            setTimeout(function () {
                                $elBlock.removeClass('block-opt-refresh');
                            }, 2000);
                        }
                        break;
                    case 'state_loading':
                        $elBlock.addClass('block-opt-refresh');
                        break;
                    case 'state_normal':
                        $elBlock.removeClass('block-opt-refresh');
                        break;
                    case 'close':
                        $elBlock.hide();
                        break;
                    case 'open':
                        $elBlock.show();
                        break;
                    default:
                        return false;
                }
            }
        }
    };

    // Material inputs helper
    var uiForms = function () {
        jQuery('.form-material.floating > .form-control').each(function () {
            var $input = jQuery(this);
            var $parent = $input.parent('.form-material');

            if ($input.val()) {
                $parent.addClass('open');
            }

            $input.on('change', function () {
                if ($input.val()) {
                    $parent.addClass('open');
                } else {
                    $parent.removeClass('open');
                }
            });
        });
    };

    // Set active color themes functionality
    var uiHandleTheme = function () {
        var $cssTheme = jQuery('#css-theme');

        // Set the active color theme link as active
        jQuery('[data-toggle="theme"][data-theme="' + ($cssTheme.length ? $cssTheme.attr('href') : 'default') + '"]')
            .parent('li')
            .addClass('active');

        // When a color theme link is clicked
        jQuery('[data-toggle="theme"]').on('click', function () {
            var $this = jQuery(this);
            var $theme = $this.data('theme');

            // Set this color theme link as active
            jQuery('[data-toggle="theme"]')
                .parent('li')
                .removeClass('active');

            jQuery('[data-toggle="theme"][data-theme="' + $theme + '"]')
                .parent('li')
                .addClass('active');

            // Update color theme
            if ($theme === 'default') {
                if ($cssTheme.length) {
                    $cssTheme.remove();
                }
            } else {
                if ($cssTheme.length) {
                    $cssTheme.attr('href', $theme);
                } else {
                    jQuery('#css-main')
                        .after('<link rel="stylesheet" id="css-theme" href="' + $theme + '">');
                }
            }

            $cssTheme = jQuery('#css-theme');
        });
    };

    // Scroll to element animation helper
    var uiScrollTo = function () {
        jQuery('[data-toggle="scroll-to"]').on('click', function () {
            var $this = jQuery(this);
            var $target = $this.data('target');
            var $speed = $this.data('speed') ? $this.data('speed') : 1000;

            jQuery('html, body').animate({
                scrollTop: jQuery($target).offset().top
            }, $speed);
        });
    };

    // Toggle class helper
    var uiToggleClass = function () {
        jQuery('[data-toggle="class-toggle"]').on('click', function () {
            var $el = jQuery(this);

            jQuery($el.data('target').toString()).toggleClass($el.data('class').toString());

            if ($lHtml.hasClass('no-focus')) {
                $el.blur();
            }
        });
    };

    // Add the correct copyright year
    var uiYearCopy = function () {
        var $date = new Date();
        var $yearCopy = jQuery('.js-year-copy');

        if ($date.getFullYear() === 2015) {
            $yearCopy.html('2015');
        } else {
            $yearCopy.html('2015-' + $date.getFullYear().toString().substr(2, 2));
        }
    };





    var uiPrint = function () {
        // Store all #page-container classes
        var $pageCls = $lPage.prop('class');

        // Remove all classes from #page-container
        $lPage.prop('class', '');

        // Print the page
        window.print();

        // Restore all #page-container classes
        $lPage.prop('class', $pageCls);
    };

    // Table sections functionality
    var uiTableToolsSections = function () {
        var $table = jQuery('.js-table-sections');
        var $tableRows = jQuery('.js-table-sections-header > tr', $table);

        // When a row is clicked in tbody.js-table-sections-header
        $tableRows.click(function (e) {
            var $row = jQuery(this);
            var $tbody = $row.parent('tbody');

            if (!$tbody.hasClass('open')) {
                jQuery('tbody', $table).removeClass('open');
            }

            $tbody.toggleClass('open');
        });
    };

    // Checkable table functionality
    var uiTableToolsCheckable = function () {
        var $table = jQuery('.js-table-checkable');

        // When a checkbox is clicked in thead
        jQuery('thead input:checkbox', $table).click(function () {
            var $checkedStatus = jQuery(this).prop('checked');

            // Check or uncheck all checkboxes in tbody
            jQuery('tbody input:checkbox', $table).each(function () {
                var $checkbox = jQuery(this);

                $checkbox.prop('checked', $checkedStatus);
                uiTableToolscheckRow($checkbox, $checkedStatus);
            });
        });

        // When a checkbox is clicked in tbody
        jQuery('tbody input:checkbox', $table).click(function () {
            var $checkbox = jQuery(this);

            uiTableToolscheckRow($checkbox, $checkbox.prop('checked'));
        });

        // When a row is clicked in tbody
        jQuery('tbody > tr', $table).click(function (e) {
            if (e.target.type !== 'checkbox' &&
                e.target.type !== 'button' &&
                e.target.tagName.toLowerCase() !== 'a' &&
                !jQuery(e.target).parent('label').length) {
                var $checkbox = jQuery('input:checkbox', this);
                var $checkedStatus = $checkbox.prop('checked');

                $checkbox.prop('checked', !$checkedStatus);
                uiTableToolscheckRow($checkbox, !$checkedStatus);
            }
        });
    };

    // Checkable table functionality helper - Checks or unchecks table row
    var uiTableToolscheckRow = function ($checkbox, $checkedStatus) {
        if ($checkedStatus) {
            $checkbox
                .closest('tr')
                .addClass('active');
        } else {
            $checkbox
                .closest('tr')
                .removeClass('active');
        }
    };

    var uiAppear = function () {
        // Add a specific class on elements (when they become visible on scrolling)
        jQuery('[data-toggle="appear"]').each(function () {
            var $windowW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var $this = jQuery(this);
            var $class = $this.data('class') ? $this.data('class') : 'animated fadeIn';
            var $offset = $this.data('offset') ? $this.data('offset') : 0;
            var $timeout = ($lHtml.hasClass('ie9') || $windowW < 992) ? 0 : ($this.data('timeout') ? $this.data('timeout') : 0);

            $this.appear(function () {
                setTimeout(function () {
                    $this
                        .removeClass('visibility-hidden')
                        .addClass($class);
                }, $timeout);
            }, {
                accY: $offset
            });
        });
    };

    var uiAppearCountTo = function () {
        // Init counter functionality
        jQuery('[data-toggle="countTo"]').each(function () {
            var $this = jQuery(this);
            var $after = $this.data('after');
            var $speed = $this.data('speed') ? $this.data('speed') : 1500;
            var $interval = $this.data('interval') ? $this.data('interval') : 15;

            $this.appear(function () {
                $this.countTo({
                    speed: $speed,
                    refreshInterval: $interval,
                    onComplete: function () {
                        if ($after) {
                            $this.html($this.html() + $after);
                        }
                    }
                });
            });
        });
    };

    var uiMagnific = function () {
        // Simple Gallery init
        jQuery('.js-gallery').each(function () {
            jQuery(this).magnificPopup({
                delegate: 'a.img-link',
                type: 'image',
                gallery: {
                    enabled: true
                }
            });
        });

        // Advanced Gallery init
        jQuery('.js-gallery-advanced').each(function () {
            jQuery(this).magnificPopup({
                delegate: 'a.img-lightbox',
                type: 'image',
                gallery: {
                    enabled: true
                }
            });
        });
    };

    var uiCkeditor = function () {
        // Disable auto init when contenteditable property is set to true
        CKEDITOR.disableAutoInline = true;

        // Init inline text editor
        CKEDITOR.inline('js-ckeditor-inline');

        // Init full text editor
        CKEDITOR.replace('js-ckeditor');
    };

    var uiSummernote = function () {
        // Init text editor in air mode (inline)
        jQuery('.js-summernote-air').summernote({
            airMode: true
        });

        // Init full text editor
        jQuery('.js-summernote').summernote({
            height: 90,
            minHeight: null,
            maxHeight: null
        });
    };

    var uiSlick = function () {
        // Get each slider element (with .js-slider class)
        jQuery('.js-slider').each(function () {
            var $slider = jQuery(this);

            // Get each slider's init data
            var $sliderArrows = $slider.data('slider-arrows') ? $slider.data('slider-arrows') : false;
            var $sliderDots = $slider.data('slider-dots') ? $slider.data('slider-dots') : false;
            var $sliderNum = $slider.data('slider-num') ? $slider.data('slider-num') : 1;
            var $sliderAuto = $slider.data('slider-autoplay') ? $slider.data('slider-autoplay') : false;
            var $sliderAutoSpeed = $slider.data('slider-autoplay-speed') ? $slider.data('slider-autoplay-speed') : 3000;

            // Init slick slider
            $slider.slick({
                arrows: $sliderArrows,
                dots: $sliderDots,
                slidesToShow: $sliderNum,
                autoplay: $sliderAuto,
                autoplaySpeed: $sliderAutoSpeed
            });
        });
    };

    var uiDatepicker = function () {
        // Init datepicker (with .js-datepicker and .input-daterange class)
        jQuery('.js-datepicker').add('.input-daterange').datepicker({
            weekStart: 1,
            autoclose: true,
            todayHighlight: true
        });
    };

    var uiColorpicker = function () {
        // Get each colorpicker element (with .js-colorpicker class)
        jQuery('.js-colorpicker').each(function () {
            var $colorpicker = jQuery(this);

            // Get each colorpicker's init data
            var $colorpickerMode = $colorpicker.data('colorpicker-mode') ? $colorpicker.data('colorpicker-mode') : 'hex';
            var $colorpickerinline = $colorpicker.data('colorpicker-inline') ? true : false;

            // Init colorpicker
            $colorpicker.colorpicker({
                'format': $colorpickerMode,
                'inline': $colorpickerinline
            });
        });
    };

    var uiMaskedInputs = function () {
        // Init Masked Inputs
        // a - Represents an alpha character (A-Z,a-z)
        // 9 - Represents a numeric character (0-9)
        // * - Represents an alphanumeric character (A-Z,a-z,0-9)
        jQuery('.js-masked-date').mask('99/99/9999');
        jQuery('.js-masked-date-dash').mask('99-99-9999');
        jQuery('.js-masked-phone').mask('(999) 999-9999');
        jQuery('.js-masked-phone-ext').mask('(999) 999-9999? x99999');
        jQuery('.js-masked-taxid').mask('99-9999999');
        jQuery('.js-masked-ssn').mask('999-99-9999');
        jQuery('.js-masked-pkey').mask('a*-999-a999');
    };

    var uiTagsInputs = function () {
        // Init Tags Inputs (with .js-tags-input class)
        jQuery('.js-tags-input').tagsInput({
            height: '36px',
            width: '100%',
            defaultText: 'Add tag',
            removeWithBackspace: true,
            delimiter: [',']
        });
    };

    var uiSelect2 = function () {
        // Init Select2 (with .js-select2 class)
        jQuery('.js-select2').select2();
    };

    var uiHighlightjs = function () {
        // Init Highlight.js
        hljs.initHighlightingOnLoad();
    };


    var uiNotify = function () {
        jQuery('.js-notify').on('click', function () {
            var $notify = jQuery(this);
            var $notifyMsg = $notify.data('notify-message');
            var $notifyType = $notify.data('notify-type') ? $notify.data('notify-type') : 'info';
            var $notifyFrom = $notify.data('notify-from') ? $notify.data('notify-from') : 'top';
            var $notifyAlign = $notify.data('notify-align') ? $notify.data('notify-align') : 'right';
            var $notifyIcon = $notify.data('notify-icon') ? $notify.data('notify-icon') : '';
            var $notifyUrl = $notify.data('notify-url') ? $notify.data('notify-url') : '';

            jQuery.notify({
                icon: $notifyIcon,
                message: $notifyMsg,
                url: $notifyUrl
            }, {
                element: 'body',
                type: $notifyType,
                allow_dismiss: true,
                newest_on_top: true,
                showProgressbar: false,
                placement: {
                    from: $notifyFrom,
                    align: $notifyAlign
                },
                offset: 20,
                spacing: 10,
                z_index: 1031,
                delay: 5000,
                timer: 1000,
                animate: {
                    enter: 'animated fadeIn',
                    exit: 'animated fadeOutDown'
                }
            });
        });
    };

    var uiDraggableItems = function () {
        // Init draggable items functionality (with .js-draggable-items class)
        jQuery('.js-draggable-items').sortable({
            connectWith: '.draggable-column',
            items: '.draggable-item',
            opacity: .75,
            handle: '.draggable-handler',
            placeholder: 'draggable-placeholder',
            tolerance: 'pointer',
            start: function (e, ui) {
                ui.placeholder.css({
                    'height': ui.item.outerHeight(),
                    'margin-bottom': ui.item.css('margin-bottom')
                });
            }
        });
    };

    var uiEasyPieChart = function () {
        // Init Easy Pie Charts (with .js-pie-chart class)
        jQuery('.js-pie-chart').easyPieChart({
            barColor: jQuery(this).data('bar-color') ? jQuery(this).data('bar-color') : '#777777',
            trackColor: jQuery(this).data('track-color') ? jQuery(this).data('track-color') : '#eeeeee',
            lineWidth: jQuery(this).data('line-width') ? jQuery(this).data('line-width') : 3,
            size: jQuery(this).data('size') ? jQuery(this).data('size') : '80',
            animate: 750,
            scaleColor: jQuery(this).data('scale-color') ? jQuery(this).data('scale-color') : false
        });
    };

    var tableFullData = function () {
        jQuery('.js-dataTable-full').dataTable({
            columnDefs: [{
                orderable: false,
                targets: [4]
            }],
            pageLength: 10,
            lengthMenu: [
                [5, 10, 15, 20],
                [5, 10, 15, 20]
            ]
        });
    };

    var tableSimpleData = function () {
        jQuery('.js-dataTable-simple').dataTable({
            columnDefs: [{
                orderable: false,
                targets: [4]
            }],
            pageLength: 10,
            lengthMenu: [
                [5, 10, 15, 20],
                [5, 10, 15, 20]
            ],
            searching: false,
            oLanguage: {
                sLengthMenu: ""
            },
            dom: "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-6'i><'col-sm-6'p>>"
        });
    };

    var tableBs = function () {
        var $DataTable = jQuery.fn.dataTable;

        jQuery.extend(true, $DataTable.defaults, {
            dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-6'i><'col-sm-6'p>>",
            renderer: 'bootstrap',
            oLanguage: {
                sLengthMenu: "_MENU_",
                sInfo: "Showing <strong>_START_</strong>-<strong>_END_</strong> of <strong>_TOTAL_</strong>",
                oPaginate: {
                    sPrevious: '<i class="fa fa-angle-left"></i>',
                    sNext: '<i class="fa fa-angle-right"></i>'
                }
            }
        });

        jQuery.extend($DataTable.ext.classes, {
            sWrapper: "dataTables_wrapper form-inline dt-bootstrap",
            sFilterInput: "form-control",
            sLengthSelect: "form-control"
        });

        $DataTable.ext.renderer.pageButton.bootstrap = function (settings, host, idx, buttons, page, pages) {
            var api = new $DataTable.Api(settings);
            var classes = settings.oClasses;
            var lang = settings.oLanguage.oPaginate;
            var btnDisplay, btnClass;

            var attach = function (container, buttons) {
                var i, ien, node, button;
                var clickHandler = function (e) {
                    e.preventDefault();
                    if (!jQuery(e.currentTarget).hasClass('disabled')) {
                        api.page(e.data.action).draw(false);
                    }
                };

                for (i = 0, ien = buttons.length; i < ien; i++) {
                    button = buttons[i];

                    if (jQuery.isArray(button)) {
                        attach(container, button);
                    } else {
                        btnDisplay = '';
                        btnClass = '';

                        switch (button) {
                            case 'ellipsis':
                                btnDisplay = '&hellip;';
                                btnClass = 'disabled';
                                break;

                            case 'first':
                                btnDisplay = lang.sFirst;
                                btnClass = button + (page > 0 ? '' : ' disabled');
                                break;

                            case 'previous':
                                btnDisplay = lang.sPrevious;
                                btnClass = button + (page > 0 ? '' : ' disabled');
                                break;

                            case 'next':
                                btnDisplay = lang.sNext;
                                btnClass = button + (page < pages - 1 ? '' : ' disabled');
                                break;

                            case 'last':
                                btnDisplay = lang.sLast;
                                btnClass = button + (page < pages - 1 ? '' : ' disabled');
                                break;

                            default:
                                btnDisplay = button + 1;
                                btnClass = page === button ?
                                    'active' : '';
                                break;
                        }

                        if (btnDisplay) {
                            node = jQuery('<li>', {
                                    'class': classes.sPageButton + ' ' + btnClass,
                                    'aria-controls': settings.sTableId,
                                    'tabindex': settings.iTabIndex,
                                    'id': idx === 0 && typeof button === 'string' ?
                                        settings.sTableId + '_' + button : null
                                })
                                .append(jQuery('<a>', {
                                        'href': '#'
                                    })
                                    .html(btnDisplay)
                                )
                                .appendTo(container);

                            settings.oApi._fnBindAction(
                                node, {
                                    action: button
                                }, clickHandler
                            );
                        }
                    }
                }
            };

            attach(
                jQuery(host).empty().html('<ul class="pagination"/>').children('ul'),
                buttons
            );
        };

        if ($DataTable.TableTools) {
            jQuery.extend(true, $DataTable.TableTools.classes, {
                "container": "DTTT btn-group",
                "buttons": {
                    "normal": "btn btn-default",
                    "disabled": "disabled"
                },
                "collection": {
                    "container": "DTTT_dropdown dropdown-menu",
                    "buttons": {
                        "normal": "",
                        "disabled": "disabled"
                    }
                },
                "print": {
                    "info": "DTTT_print_info"
                },
                "select": {
                    "row": "active"
                }
            });

            jQuery.extend(true, $DataTable.TableTools.DEFAULTS.oTags, {
                "collection": {
                    "container": "ul",
                    "button": "li",
                    "liner": "a"
                }
            });
        }
    };

    return {
        action: '',
        search: '',
        init: function () {
            // Init all vital functions
            uiInit();
            uiLayout();
            uiNav();
            uiBlocks();
            uiForms();
            uiHandleTheme();
            uiToggleClass();
            uiScrollTo();
            uiYearCopy();
        },
        setTags: function (tagList) {
            jQuery('.js-tags-input').importTags(tagList);
        },
        layout: function ($mode) {
            uiLayoutApi($mode);
        },
        blocks: function ($block, $mode) {
            uiBlocksApi($block, $mode);
        },
        initHelper: function ($helper) {
            switch ($helper) {
                case 'print-page':
                    uiPrint();
                    break;
                case 'table-tools':
                    uiTableToolsSections();
                    uiTableToolsCheckable();
                    break;
                case 'appear':
                    uiAppear();
                    break;
                case 'appear-countTo':
                    uiAppearCountTo();
                    break;
                case 'magnific-popup':
                    uiMagnific();
                    break;
                case 'ckeditor':
                    uiCkeditor();
                    break;
                case 'summernote':
                    uiSummernote();
                    break;
                case 'slick':
                    uiSlick();
                    break;
                case 'datepicker':
                    uiDatepicker();
                    break;
                case 'colorpicker':
                    uiColorpicker();
                    break;
                case 'tags-inputs':
                    uiTagsInputs();
                    break;
                case 'masked-inputs':
                    uiMaskedInputs();
                    break;
                case 'select2':
                    uiSelect2();
                    break;
                case 'highlightjs':
                    uiHighlightjs();
                    break;
                case 'notify':
                    uiNotify();
                    break;
                case 'draggable-items':
                    uiDraggableItems();
                    break;
                case 'easy-pie-chart':
                    uiEasyPieChart();
                    break;
                default:
                    return false;
            }
        },
        initHelpers: function ($helpers) {
            if ($helpers instanceof Array) {
                for (var $index in $helpers) {
                    Master.initHelper($helpers[$index]);
                }
            } else {
                Master.initHelper($helpers);
            }
        },
        initTables: function () {
            tableBs();
            tableSimpleData();
            tableFullData();
        }
    };
}();

// Initialize app UI when page loads
jQuery(function () {
    Master.init();
});