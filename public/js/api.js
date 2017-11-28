// The Api module is designed to handle all interactions with the server

var Api = (function () {

  var domain = '';

  // Publicly accessible methods defined
  return {
    initStats: initStats,
    getIntLabels: getIntLabels,
    postIntLabel: postIntLabel,
    importIntents: importIntents,
    getEntities: getEntities,
    getAnswers: getAnswers,
    postAnsUpdate: postAnsUpdate,
    importAnswers: importAnswers,
    deleteAnswer: deleteAnswer,
    replicate: replicate,
    getDomain: getDomain,
    discoveryInfo: discoveryInfo,
    discoveryTrain: discoveryTrain
  };

  function getDomain() {
    return domain;
  }

  function initStats() {
    var http = new XMLHttpRequest();
    http.open('GET', '/init', true);
    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        var parsedRes = JSON.parse(http.responseText);
        var answers = parsedRes.answers;
        var missingAns = 0;
        var orphanCont = 0;

        domain = parsedRes.domain;

        $('#intentsNb').text(parsedRes.intents.length);
        $('#entitiesNb').text(parsedRes.entities.length);
        $('#answersNb').text(answers.length);

        for (var i = 0; i < answers.length; i++) {
          if (!answers[i].texts && !answers[i].url) {
            missingAns++;
          };
          if (answers[i].intent_uid == null) {
            orphanCont++;
          };
        };

        $('#missingAnsNb').text(missingAns);
        $('#orphanAnsNb').text(orphanCont);

        var message = '';
        if (parsedRes.intent_warnings && parsedRes.intent_warnings.length > 0) {
          message += 'Duplicate intent codes in Conversation workspace: '
          for (i in parsedRes.intent_warnings) {
            message += parsedRes.intent_warnings[i] + ', ';
          }
          message = message.substring(0, message.length - 2);
        };

        if (parsedRes.answer_warnings && parsedRes.answer_warnings.length > 0) {
          message += 'Duplicate answer codes in Conversation workspace: '
          for (i in parsedRes.answer_warnings) {
            message += parsedRes.answer_warnings[i] + ', ';
          }
          message = message.substring(0, message.length - 2);
        };

        Animation.displayWarning(message);
      }

      // Remove loading animation
      $('#dashStats').removeClass('block-opt-refresh');
    }
    http.send();

    // Add loading animation
    $('#dashStats').addClass('block-opt-refresh');
  };

  function getIntLabels(action) {
    var http = new XMLHttpRequest();
    http.open('GET', '/intents', true);
    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        var parsedRes = JSON.parse(http.responseText);

        switch (action) {
          case 'table':
            // Generate Intent Table
            IntentTable.generateTable(parsedRes.intents);
            break;
          case 'export':
            // Export Intents from db
            Dashboard.exportElms(parsedRes.intents, ' intents');
            break;
        };

        // Remove loading animation
        $('#intentCont').removeClass('block-opt-refresh');
        $('#uploadInt').removeClass('block-opt-refresh');
      }
    };

    http.send();

    // Add loading animation
    $('#intentCont').addClass('block-opt-refresh');
    $('#uploadInt').addClass('block-opt-refresh');
  };

  function postIntLabel(id, form) {
    var http = new XMLHttpRequest();
    http.open('POST', '/intents/' + id, true);
    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        var parsedRes = JSON.parse(http.responseText);

        // Refresh intents table after posting an update
        Animation.loadContainer('edit_intents_label');

        // Remove loading animation
        $('#intentCont').removeClass('block-opt-refresh');
      }
    };

    http.send(JSON.stringify(form));

    // Add loading animation
    $('#intentCont').addClass('block-opt-refresh');
  };

  function importIntents(form) {
    var http = new XMLHttpRequest();
    http.open('POST', '/intents/import', true);
    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        var parsedRes = JSON.parse(http.responseText);

        // Display success message to the user
        Animation.displaySuccess('import');

        // Remove loading animation
        $('#uploadInt').removeClass('block-opt-refresh');
        setTimeout(function () {
          location.reload();
        }, 1500);
      }
    };
    if (form.length > 0) {
      http.send(form);

      // Add loading animation
      $('#uploadInt').addClass('block-opt-refresh');
    } else {
      Animation.displayError('import');
    };
  };

  function getEntities() {
    var http = new XMLHttpRequest();
    http.open('GET', '/entities', true);
    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        var parsedRes = JSON.parse(http.responseText);

        // Generate Entities Table
        EntitiesTable.generateTable(parsedRes.entities);

        // Remove loading animation
        $('#entitiesCont').removeClass('block-opt-refresh');
      }
    };

    http.send();

    // Add loading animation
    $('#entitiesCont').addClass('block-opt-refresh');
  };

  function getAnswers(action) {
    var http = new XMLHttpRequest();
    http.open('GET', '/answers', true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        var parsedRes = JSON.parse(http.responseText);
        switch (action) {
          case 'table':
            // Generate Entities Table
            AnsTable.generateTable(parsedRes.answers);
            break;
          case 'export':
            // Export Answers from db
            Dashboard.exportElms(parsedRes.answers, ' answers');
            break;
        };

        // Remove loading animation
        $('#AnsCont').removeClass('block-opt-refresh');
        $('#uploadAns').removeClass('block-opt-refresh');
      }
    };

    http.send();

    // Add loading animation
    $('#AnsCont').addClass('block-opt-refresh');
    $('#uploadAns').addClass('block-opt-refresh');
  };

  function postAnsUpdate(form, action, search) {
    var http = new XMLHttpRequest();
    http.open('POST', '/answers/' + form.answer_ID, true);
    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        var parsedRes = JSON.parse(http.responseText);
        var status = parsedRes.success;
        switch (status) {
          case true:
            // Display success message to the user
            Animation.displaySuccess('update');
            break;
          case false:
            // Display error if answer was updated by another user
            Animation.displayError('update');
            break;
          default:
            console.log('Undefined Action Request: ' + JSON.stringify(action)); // JOKER action != status ?
        };

        // Refresh answers table after posting an update
        Animation.loadContainer('answer_content', action, search);

        // Remove loading animation
        $('#AnsCont').removeClass('block-opt-refresh');
      };
    };

    http.send(JSON.stringify(form));

    // Add loading animation
    $('#AnsCont').addClass('block-opt-refresh');
  };

  function importAnswers(form) {
    var http = new XMLHttpRequest();
    http.open('POST', '/answers/import', true);
    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        var parsedRes = JSON.parse(http.responseText);

        // Display success message to the user
        Animation.displaySuccess('import');


        // Remove loading animation
        $('#uploadAns').removeClass('block-opt-refresh');
        setTimeout(function () {
          location.reload();
        }, 1500);
      }
    };

    if (form.length > 0) {
      http.send(form);

      // Add loading animation
      $('#uploadAns').addClass('block-opt-refresh');
    } else {
      Animation.displayError('import');
    };
  };

  function deleteAnswer(answerId, action) {
    if (confirm("You are about to delete all information linked to this answer. If it has an attachement, it will be deleted. Would you like to continue?")) {
      var http = new XMLHttpRequest();
      http.open('DELETE', '/answers/' + answerId, true);
      http.setRequestHeader('Content-type', 'application/json');

      http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
          // Display success message to the user
          Animation.displaySuccess('delete');

          // Refresh answers table after posting an update
          Animation.loadContainer('answer_content', action);

          // Remove loading animation
          $('#uploadAns').removeClass('block-opt-refresh');
        } else if (http.readyState === 4) {
          Animation.displayError('delete');
        };
      };
      // Add loading animation
      http.send();
      $('#uploadAns').addClass('block-opt-refresh');
    }
  };

  function replicate() {
    if (confirm("You are about to replace the DB in the DEMO env by the DB in the DEV env! Would you like to continue?")) {
      var http = new XMLHttpRequest();
      http.open('GET', '/replicateDB', true);
      http.setRequestHeader('Content-type', 'application/json');

      http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
          // Display success message to the user
          Animation.displaySuccess('replicate');

          // Remove loading animation
          $('#uploadAns').removeClass('block-opt-refresh');
        } else if (http.readyState === 4) {
          Animation.displayError();
        };
      };
      // Add loading animation
      http.send();
      $('#uploadAns').addClass('block-opt-refresh');
    }
  };

  function discoveryInfo(cb) {
    var http = new XMLHttpRequest();
    http.open('GET', '/discovery/trainingInfo', true);

    http.onreadystatechange = function () {
      if (http.readyState === 4 && (http.status === 200 || http.status === 304)) {
        cb(http.responseText);
      }
    };
    http.send();
  };

  function discoveryTrain(cb) {
    var http = new XMLHttpRequest();
    http.open('GET', '/discovery/train', true);

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200) {
        cb(http.responseText);
      }
    };
    http.send();
  };

}());
