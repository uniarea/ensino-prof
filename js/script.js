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

$(document).ready(function() {
    //Bootstap's tooltip
    $('[data-toggle="tooltip"]').tooltip();

    $("#before1213table").toggle();

    //Toggle grades' box when respective checkbox is clicked
    $(".checker").click(function() {
        $(this).next().toggle();
        $(this).next().val('0')
    });
});

var addSubject = function(){
  if(nrSubjects < 12){
    $("#extra-subjects").append("<tr><td><input class=\"subject-name\" name=\"extra-subject-name-" + nrSubjects + "\" type=\"text\" placeholder=\"Nome disciplina\"></td><td><input class=\"grade\" min=\"1\" max=\"20\" type=\"number\" name=\"grade"+nrSubjects+"\" value=\"10\"/></td></tr>");
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
    $("#before1213table").toggle();
    $("#after1213table").toggle();
    $("#after1213header").toggle();
    before1213 = true;
  }
}

var setNewerTable = function(){
  if(before1213){
    $("#before1213table").toggle();
    $("#after1213table").toggle();
    $("#after1213header").toggle();
    before1213 = false;
  }
}

var getUnitExams = function(index) {
    var values = $('input[name^=exam' + index + ']').map(function(idx, elem) {
        //if current value is a number (actually, a string that holds a number), return the value (as a number)
        var currentValue = parseInt($(elem).val());
        if(!isNaN(currentValue))
            return currentValue;

        //if it's not a number, it's a checkox -> get checkbox value
        return $(elem).is(':checked');
    }).get();
    return values;
}

var calculateCFCwPE = function(){
  var sum = 0;
  for(let i = 0; i < nrSubjects; ++i)
    sum += parseInt($('input[name=grade'+i+']').val());
  var mcd = Math.round(sum*10/nrSubjects)/10;
  var fct = parseInt($('#fct-grade').val());
  var pap = parseInt($('#pap-grade').val());
  return Math.trunc(((2*mcd+(3*fct+7*pap)/10)/3)*10);
}

var calculateCFCwoPE = function(){
  var sum = 0;
  for(let i = 0; i < nrSubjects; ++i){
    if(i != 4)
      sum += parseInt($('input[name=grade'+i+']').val());
  }
  var mcd = Math.round(sum*10/(nrSubjects-1))/10;
  var fct = parseInt($('#fct-grade').val());
  var pap = parseInt($('#pap-grade').val());
  return Math.trunc(((2*mcd+(3*fct+7*pap)/10)/3)*10);
}

var calculateCFCEPEwPE = function(){
  if(before1213)
    return calculateCFCEPEBefore1213wPE();
  return calculateCFCEPEAfter1213wPE();
}

var calculateCFCEPEwoPE = function(){
  if(before1213)
    return calculateCFCEPEBefore1213woPE();
  return calculateCFCEPEAfter1213woPE();
}

var calculateCFCEPEBefore1213wPE = function(){
  var result = calculateCFCwPE();
  return [result, result];
}

var calculateCFCEPEBefore1213woPE = function(){
  var result = calculateCFCWoPE();
  return [result, result];
}

var calculateCFCEPEAfter1213wPE = function(){
  var cfc = calculateCFCwPE();
  var ptexams = getUnitExams(3);
  var secondsubjectexams = getUnitExams(4);
  var ptexam_firstphase = ptexams[0];
  var ptexam_secondphase = (ptexams[1] ? Math.max(ptexam_firstphase, ptexams[2]) : ptexam_firstphase);
  var secondsubject_firstphase = secondsubjectexams[0];
  var secondsubject_secondphase = (secondsubjectexams[1] ? Math.max(secondsubject_firstphase, secondsubjectexams[2]) : secondsubject_firstphase);
  var first_phase_cfcepe = Math.round((7*cfc+3*Math.round((ptexam_firstphase+secondsubject_firstphase)/2))/10);
  var second_phase_cfcepe = Math.round((7*cfc+3*Math.round((ptexam_secondphase+secondsubject_secondphase)/2)));
  return [first_phase_cfcepe, second_phase_cfcepe];
}

var calculateCFCEPEAfter1213woPE = function(){
  var cfc = calculateCFCwoPE();
  var ptexams = getUnitExams(3);
  var secondsubjectexams = getUnitExams(4);
  var ptexam_firstphase = ptexams[0];
  var ptexam_secondphase = (ptexams[1] ? Math.max(ptexam_firstphase, ptexams[2]) : ptexam_firstphase);
  var secondsubject_firstphase = secondsubjectexams[0];
  var secondsubject_secondphase = (secondsubjectexams[1] ? Math.max(secondsubject_firstphase, secondsubjectexams[2]) : secondsubject_firstphase);
  var first_phase_cfcepe = Math.round((7*cfc+3*Math.round((ptexam_firstphase+secondsubject_firstphase)/2))/10);
  var second_phase_cfcepe = Math.round((7*cfc+3*Math.round((ptexam_secondphase+secondsubject_secondphase)/2)));
  return [first_phase_cfcepe, second_phase_cfcepe];
}

//Get access values (provas de ingresso)
var getAccessValues = function(first, last) {
    var res = [];
    var current = "";

    for(var i = first; i <= last; i++)
        res.push($('input[name^=access' + i + ']:checked').val());
    return res;
}

//Calculate access exams score
var calculateAccessScores = function() {
    var first = (before1213 ? 0 : 3);
    var last = (before1213 ? 2 : 6);
    var accessValues = getAccessValues(first, last);

    var firstPhase = 0;
    var secondPhase = 0;
    var counter = 0;

    for(var i = 0; i < accessValues.length; i++) {
        var currentExams = getUnitExams(first+i);
        if(accessValues[i] == 'yes') {
            counter++;
            if(first+i == 3 || first+i == 4){ //Special cases where 1st phase exam doesn't depend on a checkbox
              firstPhase += currentExams[0]; //First Phase Exam
              secondPhase += (currentExams[1] ? Math.max(currentExams[0], currentExams[2]) : currentExams[0]); //Max of all exams
            }
            else{
              firstPhase += currentExams[1]; //First Phase Exam
              secondPhase += (currentExams[2] ? Math.max(currentExams[1], currentExams[3]) : currentExams[1]); //Max of all exams
            }
        }
    }
    firstPhase = Math.trunc((firstPhase/counter)*10)/10;
    secondPhase = Math.trunc((secondPhase/counter)*10)/10;

    return [firstPhase, secondPhase];
}

//Calculate final score
var calculateFinalScore = function() {
    var accessExamsWeight = $("#accessPercentage").val() / 100;
    var internalScoreWeight = 1 - accessExamsWeight;

    var accessScores = calculateAccessScores();
    var internalScores = (before1213 ? calculateCFCEPEBefore1213woPE() : calculateCFCEPEAfter1213woPE());

    var firstPhase = (accessScores[0] * accessExamsWeight + internalScores[0] * internalScoreWeight).toPrecision(4);
    var secondPhase = (accessScores[1] * accessExamsWeight + internalScores[1] * internalScoreWeight).toPrecision(4);

    return [firstPhase, secondPhase];
}

//Calculate final score for SPORT courses
var calculateFinalScoreSport = function() {
    var accessExamsWeight = $("#accessPercentage").val() / 100;
    var internalScoreWeight = 1 - accessExamsWeight;

    var accessScores = calculateAccessScores();
    var internalScores = (before1213 ? calculateCFCEPEBefore1213wPE() : calculateCFCEPEAfter1213wPE());

    var firstPhase = (accessScores[0] * accessExamsWeight + internalScores[0] * internalScoreWeight).toPrecision(4);
    var secondPhase = (accessScores[1] * accessExamsWeight + internalScores[1] * internalScoreWeight).toPrecision(4);

    return [firstPhase, secondPhase];
}

//Verify input
//TODO: Update to current model
var verifyInput = function() {

    //Units' grades (1-20)
    var units = [];

    //Exams' grades (0-200)
    var exams = [];

    var first = (before1213 ? 0 : 3);
    var last = (before1213 ? 2 : 6);

    //Access Values (Provas de Ingresso (sim-nao))
    var accessValues = getAccessValues(first, last);

    //Get unit's and exams' values
    for(var i = 0; i < nrSubjects; i++) {
        units.push($('input[name=grade' + i + ']').map(function(idx, elem) {
            return parseInt($(elem).val());
        }).get());
    }

    for(let j = first; j <= last; j++)
      exams.push(getUnitExams(j));

    var units2 = steamrollArray(units).filter(function(val) {
        return val >= 1 && val <= 20 && $.isNumeric(val);
    })

    var exams2 = steamrollArray(exams).filter(function(val) {
        return val >= 0 && val <= 200 && $.isNumeric(val);
    })

    accessValues = accessValues.filter(function(val) {
        return val == 'yes';
    })

    var hasError = false;
    var errors = "";

    if(units.length != units2.length) {
        hasError = true;
       errors += "<li>Há pelo menos uma nota de disciplina com um valor inválido.</li>";
    }

    if((before1213 && exams2.length != 6) || (!before1213 && exams2.length != 8)) {
        hasError = true;
       errors += "<li>Há pelo menos uma nota de exame com um valor inválido.</li>";
    }

    if(accessValues.length == 0) {
        hasError = true;
        errors += "<li>Tens de ter <strong>pelo menos</strong> uma prova de ingresso.</li>";
    }

    if(hasError) {
        $("#inputErrorText").append(errors);
        $("#inputError").css("display","block");
    }
}

//Display scores on screen
var displayScores = function() {
    //Reset error state
    $("#inputErrorText").empty();
    $("#inputError").css("display","none");

    //Verify input but calculate anyway
    verifyInput();

    var accessExamsWeight = $("#accessPercentage").val();
    var internalScoreWeight = 100 - accessExamsWeight;

    var accessExamsScore = calculateAccessScores();

    var internalScores = before1213 ? calculateCFCEPEBefore1213woPE() : calculateCFCEPEAfter1213woPE();
    var internalScoresSport = before1213 ? calculateCFCEPEBefore1213wPE() : calculateCFCEPEAfter1213wPE();

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

var getAllGrades = function(){
  var grades = [];
  for(let i = 0; i < nrSubjects; i++)
    grades.push(parseInt($('input[name^=grade'+i+']').val()));
  return grades;
}

//Save scores to text file
var saveScores = function(){
  var results = "Classificações Finais das Disciplinas:\r\n";
  var cfds = getAllGrades();
  var subjects = ["Português", "Língua Estrangeira", "Área de Integração", "TIC (ou equivalente)", "Educação Física"];
  //NOT DETECTING EMPTY TEXT BOX
  for(let i = 5; i < nrSubjects; i++){
    let subjectName = $('input[type=text][name^=extra-subject-name-'+i+']').val();
    if(!subjectName)
      subjects.push("Disciplina #"+i);
    else
      subjects.push(subjectName);
  }
  //CFDs
  for(let i = 0; i < subjects.length; i++)
      results += subjects[i] + ": " + cfds[i] + "\r\n";

  results += "Formação em Contexto de Trabalho: " + $("#fct-grade").val() + "\r\n";
  results += "Prova de Aptidão Profissional: " + $("#pap-grade").val() + "\r\n\r\n";

  if(!before1213){
    results += "Exames obrigatórios (1ª fase | 2ª fase):\r\n";
    let ptexams = getUnitExams(3);
    let secondsubjectexams = getUnitExams(4);
    let ptexam_firstphase = ptexams[0];
    let ptexam_secondphase = (ptexams[1] ? Math.max(ptexam_firstphase, ptexams[2]) : ptexam_firstphase);
    let secondsubject_firstphase = secondsubjectexams[0];
    let secondsubject_secondphase = (secondsubjectexams[1] ? Math.max(secondsubject_firstphase, secondsubjectexams[2]) : secondsubject_firstphase);
    results += "Português: " + ptexam_firstphase + " | " + ptexam_secondphase + "\r\n";
    results += "Disciplina #2: " + secondsubject_firstphase + " | " + secondsubject_secondphase + "\r\n";
  }

  results += "\n\nMédias do Ensino Secundário para Acesso ao Ensino Superior (CFCEPE):\r\n";
  results += "(Tendo em conta que assinalaste que concluíste o secundário:" + (before1213 ? "ANTES DE 2012/2013" : "EM/APÓS 2012/2013") + ")\r\n";

  //Final internal score
  var internalscores = (before1213 ? calculateCFCEPEBefore1213woPE() : calculateCFCEPEAfter1213woPE());
  var internalscoresport = (before1213 ? calculateCFCEPEBefore1213wPE() : calculateCFCEPEAfter1213wPE());
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
      results += "Cursos Área Desporto: " + finalscoresport[k] + "\r\n";
      results += "Cursos Restantes Áreas: " + finalscores[k] + "\r\n\r\n";
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
