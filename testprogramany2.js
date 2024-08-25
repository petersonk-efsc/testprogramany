/*
 * JavaScript for TestProgram
 *
 * KP
 * Jul 3, 2022
 */
 
/* https://stackoverflow.com/questions/955110/similarity-string-comparison-in-java */
/* And then converted from java to javascript with http://www.jsweet.org/jsweet-live-sandbox/ */
/**
 * Calculates the similarity (a number within 0 and 1) between two strings.
 */
function similarity (s1, s2) {
	var ns1 = s1; //.replaceAll('\r\n', '\n');
	var ns2 = s2; //.replaceAll('\r\n', '\n');
	var longer = ns1;
	var shorter = ns2;
	if (ns1.length < ns2.length) {
		longer = ns2;
		shorter = ns1;
	}
	var longerLength = longer.length;
	if (longerLength === 0) {
		return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1, s2) {
	var costs = (function (s) { var a = []; while (s-- > 0)
		a.push(0); return a; })(s2.length + 1);
	for (var i = 0; i <= s1.length; i++) {
		var lastValue = i;
		for (var j = 0; j <= s2.length; j++) {
			if (i === 0) {
				costs[j] = j;
			}
			else {
				if (j > 0) {
					var newValue = costs[j - 1];
					if ((function (c) { return c.charCodeAt == null ? c : c.charCodeAt(0); })(s1.charAt(i - 1)) != (function (c) { return c.charCodeAt == null ? c : c.charCodeAt(0); })(s2.charAt(j - 1))) {
						newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
					}
					costs[j - 1] = lastValue;
					lastValue = newValue;
				}
			}
		}
		if (i > 0) {
			costs[s2.length] = lastValue;
		}
	}
	return costs[s2.length];
}

function round100th(n) {
	return Math.round(n * 100) / 100;
}

function cleanString(s, removeOpenNewLine) {
	var cleaned = s.replaceAll('\r\n', '\n').replaceAll('\r', '\n'); //.replace(/[^\x00-\x7F]/g, '');
	if (removeOpenNewLine && cleaned[0] == '\n') {
		cleaned = cleaned.substr(1);
	}
	return cleaned;
}

function checkIt(sectionNum) {
	startTest = parseInt(document.getElementById("section" + sectionNum).dataset.starttest);
	endTest = parseInt(document.getElementById("section" + sectionNum).dataset.endtest);
	var genOutput = "";
	if (document.getElementById("btn" + startTest + "_section" + sectionNum).dataset.ttype == "source") {
		genOutput = document.getElementById("section" + sectionNum + "_code").value;
	} else {
		genOutput = document.getElementById("section" + sectionNum + "_out1").value;
		var findBack = genOutput.indexOf("\b");
		if (findBack >= 0) {
			while (findBack >= 0) {
				genOutput = genOutput.substring(0, findBack - 1) + genOutput.substring(findBack + 1);
				findBack = genOutput.indexOf("\b");
			}
			document.getElementById("section" + sectionNum + "_out1").value = genOutput;
		}
	}

	for (var i = startTest; i < endTest; i++) {
		var btnName = "btn" + (i) + "_section" + sectionNum;
		var currName = document.getElementById(btnName).innerHTML;
		var testPercent = 0;
		if (document.getElementById("btn" + i + "_section" + sectionNum).dataset.ttype == "full") {
			var compName = "#compare" + i;
			
			var lhsText = genOutput;
			$(compName).mergely('lhs', lhsText);
			var rhsText = $(compName).mergely('get', 'rhs');
			
			testPercent = (round100th(similarity(rhsText, lhsText) * 100));

			currName = currName.substring(0, currName.indexOf("="));
			document.getElementById(btnName).innerHTML = currName + "= " + testPercent + "%";
		} else if (document.getElementById("btn" + i + "_section" + sectionNum).dataset.ttype == "mini") {
			var regex = document.getElementById("btn" + i + "_section" + sectionNum).dataset.regex;
			regex=new RegExp(regex.trim());
			
			var regexMatched = genOutput.search(regex);
			var matchedText = "FAIL";
			var testPercent = 0;
			if (regexMatched >= 0) {
				matchedText = "PASS";
				testPercent = 100;
			}
			currName = currName.substring(0, currName.indexOf("-"));
			document.getElementById("output" + i).innerHTML = genOutput.replace(/</g, '&lt;');
			document.getElementById(btnName).innerHTML = currName + "-> " + matchedText + " = " + testPercent + "%"
		} else if (document.getElementById("btn" + i + "_section" + sectionNum).dataset.ttype == "source") {
			var regex = document.getElementById("btn" + i + "_section" + sectionNum).dataset.regex;
			regex=new RegExp(regex.trim());
		
			var regexMatched = genOutput.search(regex);
			var matchedText = "FAIL";
			var testPercent = 0;
			if (regexMatched >= 0) {
				matchedText = "PASS";
				testPercent = 100;
			}
			currName = currName.substring(0, currName.indexOf("-"));
			document.getElementById("code" + i).innerHTML = genOutput.replace(/</g, '&lt;');
			document.getElementById(btnName).innerHTML = currName + "-> " + matchedText + " = " + testPercent + "%"
		}
		document.getElementById("test" + i + "_grade").innerHTML = document.getElementById(btnName).innerHTML;
		document.getElementById("test" + i + "_grade").dataset.grade = testPercent;
		if (testPercent >= 100) {
			document.getElementById(btnName).classList.remove("failed");
			document.getElementById(btnName).classList.add("passed");
		} else {
			document.getElementById(btnName).classList.remove("passed");
			document.getElementById(btnName).classList.add("failed");
		}
	}
	var numTests = document.getElementById("summary").dataset.numtests;
	var total = 0;
	for (var i = 0; i < numTests; i++) {
		total += parseInt(document.getElementById("test" + (i+1) + "_grade").dataset.grade);
	}
	var average = round100th(total / numTests);
	document.getElementById("test_overall").innerHTML = "Score: " + average + "%";
	if (average >= 100) {
		document.getElementById("summary").classList.remove("failed");
		document.getElementById("summary").classList.add("passed");
	} else {
		document.getElementById("summary").classList.remove("passed");
		document.getElementById("summary").classList.add("failed");
	}
	$('.passed').css({
		  'background-color': 'honeydew',
		  'border': '3px green solid'
	});
	$('.failed').css({
		  'background-color': 'mistyrose',
		  'border': '3px darkred solid'
	});
}

function readSourceFile(sectionNum) {
	var sourceSection = document.getElementById('section' + sectionNum);
	var sourceResults = document.getElementById('section' + sectionNum + "_upload");
	var file = sourceResults.files[0];
	if (file.name == sourceSection.dataset.fname) {
		var reader = new FileReader();
		reader.onload = function(e) {
			sourceText = reader.result;
			document.getElementById("section" + sectionNum + "_code").value = sourceText;
			sourceResults.value = '';
		}
		reader.readAsBinaryString(file);
	} else {
		document.getElementById("section" + sectionNum + "_code").value = "Attempted to upload incorrect file";
	}
}

/* https://forums.asp.net/t/2119943.aspx?convert+txt+file+to+javascript+array */
function readSetupFile() {
	var fileResults = document.getElementById('fileResults');
	var file = fileResults.files[0];
	var reader = new FileReader();
	var sumDivText = "<span id='test_overall'>Score: 0%</span><br/>";
	var total = 0;
	var numTests = 0;
	var numSamples = 0;

	reader.onload = function(e) {
		resultsText = reader.result;
		document.getElementById('fileResults').value = '';
		document.getElementById('results').innerHTML = "";
		document.getElementById("summary").dataset.numtests = 0;
		document.getElementById("summary").classList.remove("failed");
		document.getElementById("summary").classList.remove("passed");
		document.getElementById("summary").style.backgroundColor = document.body.style.backgroundColor;
		document.getElementById("summary").style.borderColor = "black";
		document.getElementById("summary").innerHTML = "";

		var parser;
		var xmlDoc;
		
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(resultsText,"text/xml");
		
		var sectionDivText = "";

		var sampleNodes = xmlDoc.getElementsByTagName("sample");
		if (sampleNodes) {
			for (var j = 0; j < sampleNodes.length; j++) {
				numSamples++;
				var inText = sampleNodes[j].getElementsByTagName("userinput")[0].childNodes[0].nodeValue;
				inText = cleanString(inText, true); //inText.substr(2, inText.length-2);
				
				var fullOutput = sampleNodes[j].getElementsByTagName("fulloutput")[0].childNodes[0].nodeValue;
				fullOutput = cleanString(fullOutput, true); //fullOutput.substr(2, fullOutput.length-2);
				
				testNodes = sampleNodes[j].children;
				startTest = numTests;
				endTest = numTests;
				if (testNodes) {
					for (var i = 0; i < testNodes.length; i++) {
						if (testNodes[i].tagName == "test") {
							endTest++;
						} else if (testNodes[i].tagName == "minitest") {
							endTest++;
						}
					}
				}
					
				sectionDivText += '<div id="section' + j + '" data-starttest="' + (startTest+1) + '" data-endtest="' + (endTest+1) +'">'
					+ '<h1>Sample Run ' + (j + 1) + '</h1>'
					+ '<p>Enter the following at your program prompts:</p>'
					+ '<pre id="section' + j + '_in1" class=\"borderfix\">' + inText + '</pre>'
					+ '<p>Copy/paste the results of your program here:</p>'
					+ '<textarea id="section' + j + '_out1" rows="4" cols="50" wrap="off" style="width: 90%; border:1px solid black;margin-left: 2em; padding-left: 3px;">'
					+ ""
					+ '</textarea>'
					+ '<p>Then <button onclick="checkIt(' + j + ')">Check</button> and review the results below</p>'
					+ '</div>'
				testNodes = sampleNodes[j].children;
				if (testNodes) {
					for (var i = 0; i < testNodes.length; i++) {
						var btnName = "btn" + (numTests+1) + "_section" + j;
						if (testNodes[i].tagName == "test") {						
							var simPercent = 0;
							var nameText = "Run Test " + (numTests+1) + " (" + testNodes[i].getElementsByTagName("name")[0].innerHTML + ")" + " = " + simPercent + "%"
							
							sumDivText += "<br/><span id='test" + (numTests+1) + "_grade' data-grade='0'>" + nameText + "</span>";
							var extraClass = "";
							sectionDivText += 
								"<button class=\"collapsible " + extraClass + "\" id=\"" + btnName + "\" data-ttype=\"full\">" + nameText + "</button>" +
								"<div class=\"content\">" +
								"	<div style=\"height: 450px; width: 100%;\">" +
								"		<div class=\"mergely-resizer\">" +
								"			<div id=\"compare" + (numTests+1) + "\">" +
								"			</div>" +
								"		</div>" +
								"	</div>" +
								"</div>" +
								"<br>";
							numTests++;
						} else if (testNodes[i].tagName == "minitest") {
							var nameText = "Mini Test " + (numTests+1) + " (" + testNodes[i].getElementsByTagName("name")[0].innerHTML + ")";
							var regex = testNodes[i].getElementsByTagName("regex")[0].childNodes[0].nodeValue;
							var matchedText = "FAIL";
							var matchedScore = 0;

							nameText = nameText + " -> " + matchedText + " = " + matchedScore + "%"
							sumDivText += "<br/><span id='test" + (numTests+1) + "_grade' data-grade='0'>" + nameText + "</span>";
							var extraClass = "";
							sectionDivText += 
								"<button class=\"collapsible " + extraClass + "\" id=\"" + btnName + "\" data-ttype=\"mini\" data-regex=\"" + regex + "\">" + nameText +
								"</button>" +
								"<div class=\"content\">" +
								"	<p>Search For:</p>" +
								"	<pre class=\"borderfix\">" + testNodes[i].getElementsByTagName("friendlyregex")[0].childNodes[0].nodeValue.replace(/</g, "&lt;") + "</pre>" +
								"	<p>Your Output:</p>" +
								"	<pre class='borderfix' id='output" + (numTests+1) + "'>" + "---your output once entered---" + "</pre>" +
								"</div>" +
								"<br>";	
							numTests++;
						}
					}
				}
			}
		}
		
		var sourceNodes = xmlDoc.getElementsByTagName('source');
		if (sourceNodes) {
			for (var j = 0; j < sourceNodes.length; j++) {
				var fname = sourceNodes[j].getElementsByTagName("sourcefname")[0].childNodes[0].nodeValue;

				testNodes = sourceNodes[j].children;
				startTest = numTests;
				endTest = numTests;
				if (testNodes) {
					for (var i = 0; i < testNodes.length; i++) {
						if (testNodes[i].tagName == "sourcetest") {
							endTest++;
						}
					}
				}
				
				sectionDivText += '<div id="section' + (numSamples + j + 1) + '" data-starttest="' + (startTest+1) + '" data-endtest="' + (endTest+1) +'" data-fname="' + fname + '">'
					+ '<h1>Source Code ' + (j + 1) + ' - ' + fname + '</h1>'
					+ '<p>Upload ' + fname + ' with <input type="file" id="section' + (numSamples + j + 1) + '_upload" name="section' + (numSamples + j + 1) + '_upload" onchange="readSourceFile(' + (numSamples + j + 1) + ')"> or Copy/paste your source code here:</p>'
					+ '<textarea id="section' + (numSamples + j + 1) + '_code" rows="4" cols="50" wrap="off" style="width: 90%; border:1px solid black;margin-left: 2em; padding-left: 3px;">'
					+ ""
					+ '</textarea>'
					+ '<p>Then <button onclick="checkIt(' + (numSamples + j + 1) + ')">Check</button> and review the results below</p>'
					+ '</div>'
				if (testNodes) {
					for (var i = 0; i < testNodes.length; i++) {
						var btnName = "btn" + (numTests+1) + "_section" + (numSamples + j + 1);
						if (testNodes[i].tagName == "sourcetest") {
							var nameText = "Source Test " + (numTests+1) + " (" + testNodes[i].getElementsByTagName("name")[0].innerHTML + ")";
							var regex = testNodes[i].getElementsByTagName("regex")[0].childNodes[0].nodeValue;
							var genText = "**** generated ***";
							
							var matchedText = "FAIL";
							var matchedScore = 0;
							nameText = nameText + " -> " + matchedText + " = " + matchedScore + "%"
							sumDivText += "<br/><span id='test" + (numTests+1) + "_grade' data-grade='0'>" + nameText + "</span>";
							sectionDivText += 
								"<button class=\"collapsible " + extraClass + "\" id=\"" + btnName + "\"  data-ttype=\"source\" data-regex=\"" + regex + "\">" + nameText +
								"</button>" +
								"<div class=\"content\">" +
								"	<p>Search For:</p>" +
								"	<pre class=\"borderfix\">" + testNodes[i].getElementsByTagName("friendlyregex")[0].childNodes[0].nodeValue.replace(/</g, "&lt;") + "</pre>" +
								"	<p>Source File:</p>" +
								"	<pre class='borderfix' + id='code" + (numTests+1) +"'>" + "---your source code entered---" +
								"</pre>" +
								"</div>" +
								"<br>";	
							numTests++;
						}
					}
				}
			}
		}

		document.getElementById('results').innerHTML = sectionDivText;
		document.getElementById("summary").dataset.numtests = numTests;
		document.getElementById("summary").innerHTML = sumDivText;
		for (var i = 0; i < numSamples; i++) {
			sampleChildren = document.getElementById("section" + i).childNodes;
			startTest = parseInt(document.getElementById("section" + i).dataset.starttest);
			endTest = parseInt(document.getElementById("section" + i).dataset.endtest);	
			
			for (var j = startTest; j < endTest; j++) {
				if (document.getElementById("btn" + j + "_section" + i).dataset.ttype == "full") {
					var genOutput = document.getElementById("section" + i + "_out1").value;
					genOutput = cleanString(genOutput, false);
					
					var expOutput = sampleNodes[i].getElementsByTagName("fulloutput")[0].childNodes[0].nodeValue;
					expOutput = cleanString(expOutput, true); //expOutput.substr(2, expOutput.length-2);							
					var compName = "#compare" + j;
					$(compName).mergely({
						width: 'auto',
						height: 'auto',
						license: 'lgpl-separate-notice',
						cmsettings: {
							readOnly: false, 
							lineWrapping: true,
						}
					});

					var lhsText = genOutput;
					$(compName).mergely('lhs', lhsText);
					
					var rhsText = expOutput;
					$(compName).mergely('rhs', rhsText);
				}							
			}					
		}
		setupBorderFix();
		setupCollapsible();
		fileResults.value = "";
	};
	reader.readAsBinaryString(file);
}
