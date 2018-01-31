

  document.getElementById("defaultOpen").click();
  document.getElementById("inputOpen").click();

  function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    if (tabName != "input") {
    for (i = 0; i < tabcontent.length; i++) {
      if (tabcontent[i].id !== 'input') {
        tabcontent[i].style.display = "none";
      }
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        if (tablinks[i].id !== 'inputOpen') {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
    }
  }
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "flex";
    evt.currentTarget.className += " active";

}

  var inputEditor = CodeMirror.fromTextArea(document.getElementById("codeInput"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
  });

  var outputEditor = CodeMirror.fromTextArea(document.getElementById("codeOutput"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
  });

  var costEditor = CodeMirror.fromTextArea(document.getElementById("costOutput"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
  });

  const THEME = "isotope";
  inputEditor.setOption("theme", THEME);
  outputEditor.setOption("theme", THEME);
  costEditor.setOption("theme", THEME);

  function stringifyCosts(costs) {
    var allCosts = "";
    for (k in costs) {
      allCosts += k + ": " + costs[k] + "\n";
    }
    return allCosts;
  }

  var LINE_CLASS = "CodeMirror-activeline-background";

  function highlightErrors(inputEditor, lines) {
    for (var i = 0; i < lines.length; i++) {
      inputEditor.addLineClass(lines[i].start - 1, 'background', LINE_CLASS);
    }
  }
  
  function handleErrors(errors) {
    var errorStr = '';
    var lines = [];
    for (var i = 0; i < errors.length; i++) {
      var start, end;
      try {
        start = errors[i].location.start.line;
        end = errors[i].location.end.line;

      } catch (e) {
        start = '';
        end = '';
      }
      errorStr += 'Error: ' + errors[i].text + ', line: ' + start + '\n';
      lines.push({start: start, end: end});
    }
    return {errorStr: errorStr, lines: lines};
  }

  // function formatCosts(costs) {
  //   var costStr = '';
  //   for (var id in costs) {
  //     costStr += costs[id].name + ': ' + costs[id].cost + '\n';
  //   }
  //   return costStr;
  // }



  $(document).ready(function() {
    document.getElementById("defaultOpen").click();

    $('#submitBtn').click(function (){
      var code = $('#codeInput').val();
      var text = inputEditor.getValue();

      $.ajax({
        type: "POST",
        url: '/postCode',
        data: {code: text},
        success: function(data){
          data = JSON.parse(data);

          if (data.ast.error.length > 0) {
        
            var errorObj = handleErrors(data.ast.error);
            outputEditor.setValue(errorObj.errorStr);
            costEditor.setValue('0');
            clearCharts();

            highlightErrors(inputEditor, errorObj.lines);

          } else {
            outputEditor.setValue(data.code);
            costEditor.setValue(JSON.stringify(data.costs));
            
            clearCharts(); 
            generateCharts(data.costs);
          }
        },
        dataType: 'text'
      });
    });
  });