//Clipboardjs
var clipboard = new Clipboard('.clip', {
  text: function() {
    return 'https://uniarea.github.io';
}
});

clipboard.on('success', function(e) {
  console.log(e);
});

clipboard.on('error', function(e) {
  console.log(e);
});

var nrSubjects = 10;
var before1213 = false;
var before1213table = $("#exams-table").html();
var after1213table = "<tr><td></td><td>Português</td><td><input class=\"checker\" type=\"checkbox\" name=\"exam0[]\"><input class=\"grade\" type=\"number\" min=\"0\" max=\"200\" name=\"exam0[]\" hidden></td><td>\
        <input class=\"checker\" type=\"checkbox\" name=\"exam0[]\">\
        <input class=\"grade\" type=\"number\" min=\"0\" max=\"200\" name=\"exam0[]\" hidden>\
    </td>\
    <td>\
        <input type=\"radio\" name=\"access0[]\" value=\"yes\"/> Sim\
        <input type=\"radio\" name=\"access0[]\" value=\"no\" checked/> Não\
    </td>\
</tr>\
<tr>\
    <td>\
    </td>\
    <td>Disciplina #2<b href=\"#\" data-placement=\"top\" data-toggle=\"tooltip\" role=\"help\" title=\"\" class=\"small\" data-original-title=\"Segundo o regulamento, um qualquer exame (exceto Português) entre a oferta dentro dos diferentes cursos científico-humanísticos\"><sup>(?)</sup></td>\
    <td>\
        <input class=\"checker\" type=\"checkbox\" name=\"exam1[]\">\
        <input class=\"grade\" type=\"number\" min=\"0\" max=\"200\" name=\"exam1[]\" hidden>\
    </td>\
    <td>\
        <input class=\"checker\" type=\"checkbox\" name=\"exam1[]\">\
        <input class=\"grade\" type=\"number\" min=\"0\" max=\"200\" name=\"exam1[]\" hidden>\
    </td>\
    <td>\
        <input type=\"radio\" name=\"access1[]\" value=\"yes\"/> Sim\
        <input type=\"radio\" name=\"access1[]\" value=\"no\" checked/> Não\
    </td>\
</tr>\
<tr>\
    <td>\
        <input type=\"radio\" name=\"access2[]\" value=\"yes\"/> Sim\
        <input type=\"radio\" name=\"access2[]\" value=\"no\" checked/> Não\
    </td>\
    <td>\
      <input class=\"subject-name\" type=\"text\" placeholder=\"Nome disciplina\">\
    </td>\
    <td>\
        <input class=\"checker\" type=\"checkbox\" name=\"exam2[]\">\
        <input class=\"grade\" type=\"number\" min=\"0\" max=\"200\" name=\"exam2[]\" hidden>\
    </td>\
    <td>\
        <input class=\"checker\" type=\"checkbox\" name=\"exam2[]\">\
        <input class=\"grade\" type=\"number\" min=\"0\" max=\"200\" name=\"exam2[]\" hidden>\
    </td>\
</tr>\
<tr>\
    <td>\
        <input type=\"radio\" name=\"access3[]\" value=\"yes\"/> Sim\
        <input type=\"radio\" name=\"access3[]\" value=\"no\" checked/> Não\
    </td>\
    <td>\
      <input class=\"subject-name\" type=\"text\" placeholder=\"Nome disciplina\">\
    </td>\
    <td>\
        <input class=\"checker\" type=\"checkbox\" name=\"exam3[]\">\
        <input class=\"grade\" type=\"number\" min=\"0\" max=\"200\" name=\"exam3[]\" hidden>\
    </td>\
    <td>\
        <input class=\"checker\" type=\"checkbox\" name=\"exam3[]\">\
        <input class=\"grade\" type=\"number\" min=\"0\" max=\"200\" name=\"exam3[]\" hidden>\
    </td>\
</tr>";

$(document).ready(function() {
    //Bootstap's tooltip
    $('[data-toggle="tooltip"]').tooltip();

    //Toggle grades' box when respective checkbox is clicked
    $(".checker").click(function() {
        $(this).next().toggle();
        $(this).next().val('0')
    });
});

var addSubject = function(){
  if(nrSubjects < 12){
    $("#extra-subjects").append("<tr><td><input class=\"subject-name\" type=\"text\" placeholder=\"Nome disciplina\"</td><td><input class=\"grade\" min=\"1\" max=\"20\" type=\"number\" name=\"grade"+(nrSubjects-1)+"[]\" value=\"10\"/></td></tr>");
    nrSubjects++;
  }
}

var removeSubject = function(){
  if(nrSubjects > 10){
    $("#extra-subjects").children().last().remove();
    nrSubjects--;
  }
}

var setOlderTable = function(){
  if(!before1213){
    $("#exams-table").html(before1213table);
    before1213 = true;
  }
}

var setNewerTable = function(){
  if(before1213){
    $("#exams-table").html("SUCKAAAAAAAAAA");
    before1213 = false;
  }
}

//Verify input
//TODO: Update to current model
var verifyInput = function() {

    //Units' grades (1-20)
    var units = [];

    //Exams' grades (0-200)
    var exams = [];

    //Access Values (Provas de Ingresso (sim-nao))
    var accessValues = getAccessValues();

    //Get unit's and exams' values
    for(var i = 0; i < 9; i++) {
        units.push($('input[name^=grade' + i + ']').map(function(idx, elem) {
            return parseInt($(elem).val());
        }).get());

        exams.push(getUnitExams(i));
    }

    units = steamrollArray(units).filter(function(val) {
        return val >= 1 && val <= 21 && $.isNumeric(val);
    })

    exams = steamrollArray(exams).filter(function(val) {
        return val >= 0 && val <= 200 && $.isNumeric(val);
    })

    accessValues = accessValues.filter(function(val) {
        return val == 'yes';
    })

    var hasError = false;
    var errors = "";

    // 19 and 36 -> number of input boxes
    if(units.length != 19) {
        hasError = true;
       errors += "<li>Há pelo menos uma nota de disciplina com um valor inválido.</li>";
    }

    if(exams.length != 36) {
        hasError = true;
       errors += "<li>Há pelo menos uma nota de exame com um valor inválido.</li>";
    }

    if(accessValues.length == 0) {
        hasError = true;
        errors += "<li>Tens de ter pelo menos uma disciplina marcada com \"Sim\" na coluna de <strong>Provas de Ingresso</strong>.</li>";
    }

    if(hasError) {
        $("#inputErrorText").append(errors);
        $("#inputError").css("display","block");
    }
}

//Display scores on screen
//TODO: Update to current model
var displayScores = function() {
    //Reset error state
    $("#inputErrorText").empty();
    $("#inputError").css("display","none");

    //Verify input but calculate anyway
    verifyInput();

    var accessExamsWeight = $("#accessPercentage").val();
    var internalScoreWeight = 100 - accessExamsWeight;

    var accessExamsScore = calculateAccessScores();

    var internalScores = calculateInternalScores();
    var internalScoresSport = calculateInternalScoresSport();

    var finalScore = calculateFinalScore();
    var finalScoreSport = calculateFinalScoreSport();

    $("#accessExamsWeight").html(accessExamsWeight);
    $("#accessScoreFirstPhase").html(accessExamsScore[0]);
    $("#accessScoreSecondPhase").html(accessExamsScore[1]);

    $(".internalScoreWeight").html(internalScoreWeight);
    $("#internalScoreFirstPhase").html(internalScores[0]);
    $("#internalScoreSecondPhase").html(internalScores[1]);

    $("#finalScoreFirstPhase").html(finalScore[0]);
    $("#finalScoreSecondPhase").html(finalScore[1]);

    //Sports
    $(".internalScoreSportWeight").html(internalScoreWeight);
    $("#internalScoreSportFirstPhase").html(internalScoresSport[0]);
    $("#internalScoreSportSecondPhase").html(internalScoresSport[1]);

    $("#finalScoreSportFirstPhase").html(finalScoreSport[0]);
    $("#finalScoreSportSecondPhase").html(finalScoreSport[1]);

    console.log("Values displayed!");
}

//Save scores to text file
//TODO: Update to current model
var saveScores = function(){
    var results = "CFDs - Classificações Finais das Disciplinas (1ªFase | 2ªFase):\r\n";
    var cfds = calculateAllCFDs();
    var subjects = ["Português", "Filosofia", "Língua Estrangeira", "Educação Física", "Trienal Específica", "Bienal I", "Bienal II", "Anual I", "Anual II"];
    //CFDs
    for(var i = 0; i < subjects.length; i++){
        results += subjects[i] + ": " + cfds[i][0] + " | " + cfds[i][1] + "\r\n";
    }
    results += "\nMédias Finais do Ensino Secundário:\r\n";
    //Final internal score
    var internalscores = calculateInternalScores();
    var internalscoresport = calculateInternalScoresSport();
    for(var j = 0; j < 2; j++){
        results += j+1 + "ª Fase:\r\n";
        results += "Cursos Área Desporto: " + internalscoresport[j] + "\r\n";
        results += "Cursos Restantes Áreas: " + internalscores[j] + "\r\n\r\n";
    }
    //Access scores
    var accesscores = calculateAccessScores();
    results += "Média da(s) prova(s) de ingresso:\r\n";
    results += "1ª Fase: " + accesscores[0] + " | 2ª Fase: " + accesscores[1] + "\r\n\r\n";
    //Final scores
    var finalscores = calculateFinalScore();
    var finalscoresport = calculateFinalScoreSport();
    results += "--------------------\r\n";
    results += "Nota de Candidatura:\r\n";
    results += "--------------------\r\n";
    for(var k = 0; k < 2; k++){
        results += k+1 + "ª Fase:\r\n";
        results += "Cursos Área Desporto: " + finalscores[k] + "\r\n";
        results += "Cursos Restantes Áreas: " + finalscoresport[k] + "\r\n\r\n";
    }
    results += "Obrigado por utilizares o nosso simulador!\r\nhttps://uniarea.github.io/";
    //Actually save data in resultados.txt
    var blob = new Blob([results], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "resultados.txt");
}

//Auxiliary functions to transform matrix-like structures into array
function steamrollAux(arr){
  for(var i = 0; i < arr.length; i++){
    if(!Array.isArray(arr[i]))
      result.push(arr[i]);
    else
      steamrollAux(arr[i]);
  }
}

function steamrollArray(arr) {
  result = [];
  for(var i = 0; i < arr.length; i++){
    if(!Array.isArray(arr[i]))
      result.push(arr[i]);
    else
      steamrollAux(arr[i]);
  }
  return result;
}
