
  function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}



  // function createTooltip(cost) {
  //   var tooltip = document.createElement('div');
  //   tooltip.className = 'CodeMirror-hover-tooltip';

  //   var content = document.createTextNode(cost);

  //   tooltip.appendChild(content);
  //   document.body.append(tooltip);

  // }

  // function cursorActivity(cm) {
  //   var cursor = cm.getCursor();
  //   var line = cm.getLine(cursor.line);

  //   if (line.includes('function') && globalCostObj) {
  //     for (key in globalCostObj) {
  //       if (line.includes(key)) {
  //         var cost = globalCostObj[key];
  //         createTooltip(cost);          
  //       }
  //     }
  //   }
  // }

  // CodeMirror.defineOption("costAnalysis", false, function(cm, val, old) {
  //     cm.on("cursorActivity", cursorActivity);
  //   });


  var inputEditor = CodeMirror.fromTextArea(document.getElementById("codeInput"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    // costAnalysis: true
  });

  var outputEditor = CodeMirror.fromTextArea(document.getElementById("codeOutput"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    // costAnalysis: true
  });


  var costEditor = CodeMirror.fromTextArea(document.getElementById("costOutput"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    // costAnalysis: true
  });

  // var costEditor = CodeMirror.fromTextArea(document)

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

  $(document).ready(function() {
    
    $('#submitBtn').click(function (){
      var code = $('#codeInput').val();
      var text = inputEditor.getValue();

      $.ajax({
        type: "POST",
        url: '/postCode',
        data: {code: text},
        success: function(data){
 
          
          data = JSON.parse(data);
          outputEditor.setValue(data.code);
          var allCosts = stringifyCosts(data.costs);
          costEditor.setValue(allCosts);
          globalCostObj = data.costs;
        },
        dataType: 'text'
      });
    });
  });



  