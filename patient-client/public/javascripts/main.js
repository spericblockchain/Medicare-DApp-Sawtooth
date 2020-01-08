function doctor_login(event){
  event.preventDefault();
  const doctorkey = document.getElementById("doctorKey").value,
  hospitalkey = document.getElementById("hospitalKey").value,
  patientkey = document.getElementById("patientPubKey").value;
  $.post(
    "/doctor_login",
      { doctorkey: doctorkey.trim(),
        hospitalkey: hospitalkey.trim(),
        patientkey: patientkey.trim()},
     (data, textStatus, jqXHR) => {
     console.log("TCL: login -> data", data)
       
       if (data.done == 1) {
          sessionStorage.clear();
          sessionStorage.setItem("hospitalPubkey",hospitalkey);
          sessionStorage.setItem("patientPubKey",patientkey);
          sessionStorage.setItem("doctorPrivateKey", data.privatekey);
          sessionStorage.setItem("doctorName", data.doctorData.doctorName);
          sessionStorage.setItem("hospitalName", data.doctorData.hospitalName);
          sessionStorage.setItem("department", data.doctorData.department);
          sessionStorage.setItem("registerNo", data.doctorData.registerNo);
          sessionStorage.setItem("contactNo", data.doctorData.contactNo);
          sessionStorage.setItem("doctorPublicKey", data.doctorData.publickey);
          alert(data.message);
          window.location.href = "/doctorMainView";
        } else {
          alert(data.message);
          window.location.href = "/";
        }
      },
      "json"
    );
  }



function patient_login(event) {
    event.preventDefault();
    const p_key = document.getElementById("privateKey").value;
    $.post(
      "/patient_login",
      { pri_key: p_key.trim() },
       (data, textStatus, jqXHR) => {
       console.log("TCL: login -> data", data)
         
         if (data.done == 1) {
           sessionStorage.clear();
            sessionStorage.setItem("privatekey", data.privatekey);
            sessionStorage.setItem("patientPubKey",data.pubKey);
            sessionStorage.setItem("patientName", data.patientData.patientName);
            sessionStorage.setItem("age", data.patientData.age);
            sessionStorage.setItem("sex", data.patientData.sex);
            sessionStorage.setItem("blood", data.patientData.blood);
            sessionStorage.setItem("address", data.patientData.address);
            sessionStorage.setItem("contactNo", data.patientData.contactNo);
            alert(data.message);
            window.location.href = "/patientView";
          } else {
            alert(data.message);
            window.location.href = "/";
          }
        },
        "json"
      );
    }
  
  
  function logout(event) {
    event.preventDefault();
    sessionStorage.clear();
    window.location.href = "/";
  }

  function addPatient(event){
    event.preventDefault();
    const id = document.getElementById("id").value;
    const patientName = document.getElementById("patientName").value;
    const age = document.getElementById("age").value;
    const sex = document.getElementById("sex").value;
    const blood = document.getElementById("blood").value;
    const address = document.getElementById("address").value;
    const contactNo = document.getElementById("contactNo").value;
    $.post(
      "/add",
      {
        id: id.trim() ,
        patientName ,
        age,
        sex,
        blood,
        address,
        contactNo
      },
      (data, textStatus, jqXHR) => {
        alert(data.message);
        console.log("-----------",data)
        window.location.href = "/";
      },
      "json"
    );
  }

function viewPatient(event,client = ""){
  event.preventDefault();
  const key =  sessionStorage.getItem("patientPubKey");
  $.post(
    "/viewPatient",
    {
      key
    },
    (data, textStatus, jqXHR) => {
    console.log("TCL: viewPatient -> data", data.patientData.reports[0])
      document.getElementById("name").innerHTML = data.patientData.patientName
      document.getElementById("age").innerHTML = data.patientData.age
      document.getElementById("sex").innerHTML = data.patientData.sex
      document.getElementById("blood").innerHTML = data.patientData.blood
      document.getElementById("address").innerHTML = data.patientData.address
      document.getElementById("contactNo").innerHTML = data.patientData.contactNo
      let tablerow = ""
      let rating = ""
      let report = data.patientData.reports
      console.log("REPORT", report[0])
      
      for(let i = 0;i< report.length;i++){
        if (client == "patient"){
          // if(report[i].flag ==0){
            rate ="<td><form> <ul class=\"rate-area\"><input type=\"radio\" id=\"5-star" + i + " \" name=\"rating\" onclick=\"myFunction(this.value,"+i+")\" value=\"5\" /><label for=\"5-star" + i + " \" title=\"Amazing\">5 stars</label><input type=\"radio\" id=\"4-star" + i + " \" name=\"rating\" onclick=\"myFunction(this.value,"+i+")\" value=\"4\" /><label for=\"4-star" + i + " \" title=\"Good\">4 stars</label><input type=\"radio\" id=\"3-star" + i + " \" name=\"rating\" onclick=\"myFunction(this.value,"+i+")\" value=\"3\" /><label for=\"3-star" + i + " \" title=\"Average\">3 stars</label><input type=\"radio\" id=\"2-star" + i + " \" name=\"rating\" onclick=\"myFunction(this.value,"+i+")\" value=\"2\" /><label for=\"2-star" + i + " \" title=\"Not Good\">2 stars</label><input type=\"radio\" id=\"1-star" + i + " \" name=\"rating\" onclick=\"myFunction(this.value,"+i+")\" value=\"1\" /><label for=\"1-star" + i + " \" title=\"Bad\">1 star</label></ul></td><td><button type = \"submit\" id= \"result\"  onclick = \"rated(event,"+i+")\">Rate</button></td></form>"
          // rate ="<td><form><input type='text' id = verify_key" + i + " placeholder='Manufacturer Public Key'><button id = " + i + " type=\"submit\" name = \"verifyBtn\" style=\" align:center\" class=\"btn login\" onClick=verifyProduct(event)> Verify Product</button></form></td>"
          
            // }
          console.log(rate)
         tablerow = '<tr id = tr'+ i + '>'+ '<td>'+ report[i].visit + '</td>' + '<td>'+report[i].doctorName + '</td>' + '<td>'+report[i].prescription + '</td>' + '<td>'+report[i].days + '</td>' + '<td>'+report[i].rep + '</td>'+rate +'</tr>'       
         console.log(tablerow)        
        }
        else{
          tablerow = '<tr id = tr'+ i + '>'+ '<td>'+ report[i].visit + '</td>' + '<td>'+report[i].doctorName + '</td>' + '<td>'+report[i].hospitalName + '</td>' + '<td>'+report[i].prescription + '</td>' + '<td>'+report[i].days + '</td>' + '<td>'+report[i].rep + '</td>'+ '</tr>'
        }
        $('#report tr:last').after(tablerow);
      }
    },
    "json"
  );
}
function myFunction(rating,i) {
  console.log(report)
  console.log("RATING________"+rating+i);

  document.getElementById("result").value = rating;
}
function rated(event,i){
  event.preventDefault();
  const rating = document.getElementById("result").value,
  patientPubKey = sessionStorage.getItem("patientPubKey"),
  key = sessionStorage.getItem("privatekey");
  console.log("RATEEEEEE"+rating)+
  $.post(
    "/rateDoctor",
    {
      patientPubKey,
      rating,
      key,
      i
    },
    (data, textStatus, jqXHR) => {
      alert(data.message);
      console.log("-----------",data)
      window.location.href = "/reportView";
    },
    "json"
  );
}

function viewDoctor(event){
  event.preventDefault();
  document.getElementById("doctorName").innerHTML = sessionStorage.getItem("doctorName");;
  document.getElementById("hospitalName").innerHTML = sessionStorage.getItem("hospitalName");
  document.getElementById("department").innerHTML = sessionStorage.getItem("department");
  document.getElementById("registerNo").innerHTML = sessionStorage.getItem("registerNo");
  document.getElementById("doctorPublicKey").innerHTML = sessionStorage.getItem("doctorPublicKey");
  document.getElementById("contactNo").innerHTML = sessionStorage.getItem("contactNo");        
}

function addReport(event){
  event.preventDefault();
  const patientPubKey =  sessionStorage.getItem("patientPubKey"),
  doctorPrivateKey =  sessionStorage.getItem("doctorPrivateKey"),
  doctorName = sessionStorage.getItem("doctorName"),
  hospitalName = sessionStorage.getItem("hospitalName"),
  hospitalPubKey = sessionStorage.getItem("hospitalPubkey");
  const visit = document.getElementById("visit").value;
  const prescription = document.getElementById("prescription").value;
  const days = document.getElementById("days").value;
  const rep = document.getElementById("rep").value;
  $.post(
    "/addRep",
    {
      patientPubKey,
      doctorPrivateKey,
      doctorName,
      hospitalName,
      hospitalPubKey,
      visit,
      prescription,
      days,
      rep
    },
    (data, textStatus, jqXHR) => {
      alert(data.message);
      window.location.href = "/doctorMainView";
    },
    "json"
  );
}