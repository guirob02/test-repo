// var cloudantUsr = "8536925a-4f60-4d5b-a3c6-8a9572cf8001-bluemix";
var cloudantURL = "f71ab0eb-54df-4335-982e-2600d1dd4d0e-bluemix.cloudant.com";

var action = Master.action; //$('#action').attr('req');

var AnsTable = function () {

  var generateTable = function (answers) {
    // Init layout
    var bigTitle = {
      'edit': 'Edit Content ',
      'add': 'Add Content ',
      'orphan': 'Orphan Content '
    }
    var smallTitle = {
      'edit': '<small>Easy search and edit existing content</small>',
      'add': '<small>Easy search and fill missing content</small>',
      'orphan': '<small>Easy search and remove orphan content</small>'
    }
    $('#ariane-title').html(bigTitle[action])
    $('#page-title').html(bigTitle[action] + smallTitle[action]);


    // Init table
    var ansTrCont = '';
    $('#ansTbody').empty();

    for (var i = 0; i < answers.length; i++) {
      switch (action) {
        case 'edit':
          if (answers[i].texts || answers[i].url) {
            $('#ansTbody').append(generateRow(answers[i]));
          };
          break;
        case 'add':
          if (!answers[i].texts && !answers[i].url) {
            $('#ansTbody').append(generateRow(answers[i]));
          };
          break;
        case 'orphan':
          if (answers[i].intent_uid == null) {
            $('#ansTbody').append(generateRow(answers[i], action));
          };
          break;
        default:
          console.log('Undefined Action Request: ' + action);
      };
    };

    // Init once table generated
    Master.initTables();

    if(Master.search) {
      $('#AnsCont .dataTables_filter input').val(Master.search);
      $('.js-dataTable-full').DataTable().search(Master.search).draw();
    }
  };

  return {
    generateTable: generateTable,
  };
}();

function showError(message) {
  $('.error').text(message);
  $('.error').show();
}

// Generate pre-formated table row
function generateRow(elment, action) {
  var editedTags = '';
  if (elment.tags) {
    var tags = elment.tags.split(',');
    var editedTags = '';

    for (i = 0; i < tags.length; i++) {
      editedTags += '<span class="label label-primary mar-r1x">' + tags[i] + '</span>'
    };
  };

  var actionBtns = '<button class="btn btn-xs btn-default editAns" data-toggle="modal" data-target="#modal-popout" title="Edit answer" type="button"><i class="fa fa-pencil"></i></button>';

  if (elment.url) {
    var ansUrl = elment.url;
    actionBtns += '<button class="btn btn-xs btn-default dispAnsUrl" type="button" data-toggle="tooltip" title="Open URL"><i class="fa fa-link"></i></button>';
  } else {
    var ansUrl = '';
  };

  if (Master.action == 'edit') {
    actionBtns += '<button class="btn btn-xs btn-default deleteAns" type="button" data-toggle="tooltip" title="Delete answer information"><i class="fa fa-trash"></i></button>';
  };

  /*
   * Enable removing answers from the db
   *
  if(action == 'orphan'){
  	actionBtns += '<button class="btn btn-xs btn-default removeAns" type="button" data-toggle="tooltip" title="Remove Answer"><i class="fa fa-remove"></i></button>';
  }
  */

  elment.description = (elment.description ? elment.description : '');
  elment.fileId = (elment.fileId ? elment.fileId : '');
  elment.tags = (elment.tags ? elment.tags : '');
  elment.texts = (elment.texts ? elment.texts.replace(/"/gi, "'") : '');
  var editedTr = $('<tr>' +
    '<td class="text-center">' + elment.answer_uid + '</td>' +
    '<td class="hidden-xs">' + elment.description + '</td>' +
    '<td class="hidden-xs white-space elem-texts"></td>' +
    '<td class="hidden-xs">' + editedTags + '</td>' +
    '<td class="text-center hidden-xs">' +
    '<div class="btn-group">' + actionBtns + '</div>' +
    '</td>' +
    '</tr>');

  editedTr.attr('data-object', JSON.stringify(elment));

  // Display texts with HTML tags
  var ansTextDisplay = '', p;
  if (elment.texts) {
    var textArray = elment.texts.split('|');
    for (var i = 0; i < textArray.length; i++) {
      if (i == 2) {
        p = $('<p>...</p>');
        editedTr.find('.elem-texts').append(p);
        break;
      } else {
        p = $('<p></p>');
        p.text( textArray[i]);
      }
      editedTr.find('.elem-texts').append(p);
    }
  }

  return editedTr;
};

// Get intents list once page loaded
jQuery(function () {
  Api.getAnswers('table');
});

function clearDocumentInfo() {
  var elem = document.getElementById("myBar");
  elem.style.width = 0 + '%';
  elem.innerHTML = '';
  $('.upload--file-chooser-name').html('');
  $('#file_descr').html('');
  $('#ansUrl').html('');
  $('#ansUrl').removeAttr("readonly");
  $('#deleteAttachment').attr('style', 'display : none');
};

// Edit Answers
$('#ansTbody').on('click', '.editAns', function () {
  // Clean tabTemplate
  $(".tab-content").empty();
  $("li").remove(".li-tab");

  var parent = $(this).parents('tr');

  // Rebuild template
  var answerObj = JSON.parse(parent.attr('data-object'));

  var tabTemplate = '<li class="li-tab"><a href="#bs-tabdrop-tab{id}">{text}&nbsp;&nbsp;&nbsp<i class="delete-tab si si-close"></i></a></li>';
  var divTemplate = '<div class="tab-pane fade" id="bs-tabdrop-tab{id}"><div class="js-summernote" id="ansText{id}" name="ans_txt"></div></div>';
  var li, div;
  var texts = answerObj.texts;
  var textArray = texts.split('|');
  for (var i in textArray) {
    li = $(tabTemplate.replace(/\{id\}/g, i).replace(/\{text\}/g, textArray[i].substring(0, 4) + '...'));
    if (i == 0) {
      li.addClass("active");
    }
    $("#add-tab").before(li);
    div = $(divTemplate.replace(/\{id\}/g, i));
    $(".tab-content").append(div);
    $('#ansText' + i).html(textArray[i]);
  }
  $("#bs-tabdrop-tab0").addClass("in active");

  if(answerObj.type == 'CLOUDANT') {
    $.ajax({
      url: '/docs/' + answerObj.answer_uid,
      success: function (res) {
        if (res != '{}') {
          res = JSON.parse(res);
          var elem = document.getElementById("myBar");
          elem.style.width = 100 + '%';
          elem.innerHTML = '100%';
          $('.upload--file-chooser-name').html(res.title);
          $('#file_descr').html(res.file_descr);
          $('#ansUrl').val(answerObj.url);
          $('#url-form-group').hide();
          $('#deleteAttachment').attr('style', 'display : block');

          reqDbParams.title = res.title;
          reqDbParams.type = res.type;
          reqDbParams.fileId = res.fileId;

        } else {
          clearDocumentInfo();
        };
      },
      error: _error
    });
  } else {
    clearDocumentInfo();
  }

  var tagList = answerObj.tags;
  $('#ansID').val(answerObj.answer_uid);
  $('#ansDesc').val(answerObj.description);
  $('#ansUrl').val(answerObj.url);
  $('#lastUpdate').val(answerObj.last_update);

  $(".note-editor").remove();
  Master.setTags(tagList);
  Master.initHelpers(['tags-inputs', 'summernote']);
  //Master.init();
});

$('#add-tab').on('click', function () {
  var id = $(".text-responses div.tab-pane").length;
  var li = $('<li class="li-tab"><a href="#bs-tabdrop-tab' + id + '">' + id + '&nbsp;&nbsp;&nbsp<i class="delete-tab si si-close"></i></a></li>');
  var div = $('<div class="tab-pane fade" id="bs-tabdrop-tab' + id + '"><div class="js-summernote" id="ansText' + id + '" name="ans_txt"></div></div>');

  $("#add-tab").before(li);
  $(".tab-content").append(div);
  Master.initHelpers('summernote');

  li.find("a").trigger("click");
});

$('.form-group').on('click', '.delete-tab', function () {
  var li = $(this).closest("li");
  li.prev().find("a").trigger("click");
  var id = li[0].childNodes[0].hash;
  li.remove();
  $(id).remove();
});

// Submit Answers
$('#submitAnsEdit').on('click', function () {
  var editables = $(".tab-content .note-editable");
  var texts = [];
  for (var i = 0; i < editables.length; i++) {
    if(editables[i].innerHTML) {
      texts.push(editables[i].innerHTML);
    }
  }

  if(texts.length == 0) {
    $("#text-empty-error").show();
    $('html,body,#modal-popout').animate({
        scrollTop: $("#text-empty-error").offset().top
      }, 'slow');
    return false;
  }

  var form = {
    answer_ID: $('#ansID').val(),
    desc: $('#ansDesc').val(),
    texts: texts,
    url: $('#ansUrl').val(),
    last_timestamp: $('#lastUpdate').val(),
    tags: $('#ansTags').val()
  };

  $(".tab-content").remove();
  $(".bs-tabdrop").remove("li-tab"); // Voir ici si le code stagne

  if (reqDbParams.title) {
    var docObject = {
      docData : {
        'fileId': reqDbParams.fileId,
        'title': reqDbParams.title,
        'type': reqDbParams.type,
        'file_descr': $('#file_descr').val()
      },
      type: 'CLOUDANT'
    };
    form = $.extend(form, docObject);
  } else {
    if(form.url) {
      form.type = 'URL';
    } else {
      form.type = 'NONE';
    }
  }

  var search = $('#AnsCont .dataTables_filter input').val();

  Api.postAnsUpdate(form, action, search);
  $('#editContainer').fadeOut(200);
  $('#file_descr').attr("readonly", "readonly");

});

//Display Answers Url
$('#ansTbody').on('click', '.dispAnsUrl', function () {
  var dataObject = JSON.parse($(this).parents('tr').attr('data-object'));

  if(dataObject.type == 'CLOUDANT') {
    var ansUrl = dataObject.url.split('/');
    if(ansUrl.length > 1) {
      var docName = ansUrl.pop();
      var docID = ansUrl.pop();

      var docToView = Base64.encode(docID + "/" + docName);
      window.open(Api.getDomain() + '/load/' + docToView, '_blank');
    }
  } else {
    window.open(dataObject.url);
  }
});

// Delete Answer
$('#ansTbody').on('click', '.deleteAns', function () {
  var dataObject = JSON.parse($(this).parents('tr').attr('data-object'));
  Api.deleteAnswer(dataObject.answer_uid, action);
});

var reqDbParams = {
  'type': '',
  'title': '',
  'fileId': '',
  'ansDesc': ''
};

$(document).ready(function () {

  $('.answer-modal').on('click', '[data-toggle="tabs"] a, .js-tabs a', function(e) {
    if($(e.target).parent().hasClass('li-tab')) {
      e.preventDefault();
      $(e.target).tab('show');
    }
  });

  /*
   * Init fileupload for answer attachement
   * Each file is uploaded on the orchestrator server
   * The file is sent to Cloudant when the answer is saved
   * TODO: delete documents after 5 / 10 minutes?
   */
  $('#fileupload').fileupload({
    url: Api.getDomain() + '/files',
    dataType: 'json',
    dropZone: $('.dropzone'),
    acceptFileTypes: /(\.|\/)(pdf)$/i,
    add: function (e, data) {
      if (data.files && data.files[0]) {
        reqDbParams.title = data.files[0].name;
        reqDbParams.type = data.files[0].name.split('.').pop();

        // Add title in HTML and form
        $('.upload--file-chooser-name').html(reqDbParams.title);

        // Check file size
        if (data.files[0].size > 2048000) {
          showError('The file size exceeds the limit allowed. The maximum file size is 2 MB.');
          return;
        } else {
          hideError();
        };

        data.submit().complete(function (result) {
          // Update progress bar
          // TODO: Real progress bar?
          move();

          reqDbParams.fileId = JSON.parse(result.responseText).id;
          var docUrl = 'https://' + cloudantURL + '/angie_docs/' + encodeURIComponent(reqDbParams.fileId) + '/' + encodeURIComponent(reqDbParams.title);
          $('#ansUrl').val(docUrl);
          $('#url-form-group').hide();
          $('#file_descr').removeAttr("readonly");
          $('#deleteAttachment').show();
        });
      }
    },
    error: _error
  });
})

function move() {
  var elem = document.getElementById("myBar");
  var width = 10;
  var id = setInterval(frame, 10);

  function frame() {
    if (width >= 100) {
      clearInterval(id);
    } else {
      width++;
      elem.style.width = width + '%';
      elem.innerHTML = width * 1 + '%';
    }
  }
}

function _error(xhr) {
  var response = JSON.parse(xhr.responseText);
  if (response.error) {
    showError(response.error);
  }
}

function hideError() {
  $('.error').hide();
}

//Display Answers Url
$('#deleteAttachment').on('click', function () {
  $('#ansUrl').val('');
  $('#file_descr').attr("readonly", "readonly");
  $('#ansUrl').removeAttr("readonly");
  $('#url-form-group').show();
  var elem = document.getElementById("myBar");
  elem.style.width = 0 + '%';
  elem.innerHTML = '';
  $('.upload--file-chooser-name').html('');
  $('#deleteAttachment').attr('style', 'display : none');

  reqDbParams.title = null;
  reqDbParams.type = null;
  reqDbParams.fileId = null;
});

//Create Base64 Object
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
