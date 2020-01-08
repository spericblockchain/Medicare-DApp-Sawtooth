DESCRIPTION ABOUT THE DApp:


The HEALTH CARE Decentraised Application(DApp) on the Hyperledger Sawtooth Platform manages the hospital, doctor and patient registrations, their ratings and the patient record managements correspondingly. 

In this DApp, the Government Organisation client runs on the port 'http://localhost:3002' where the hospitals are registered by the organisation with their corresponding public keys which give access for the hospitals to register their respective doctors and manage their hospital client port that runs on 'http://localhost:3001'.The Organisation client can add, update and delete the hospital details and likewise, the Hospital client is used by permissioned hospitals to add, update and delete the details of the doctors in their corresponding hospital. In both the clients, a record of rating track is kept for each hospital and each doctor.

The port http://localhost:3000 is used for Doctor-Patient login and patient registration. The patient registration is done in such a way that the patient can create a record for him/herself and consult any doctor in any hospital so that each doctor consulting the particular patient can see his/her medical history record and the consulting doctor can add reports to the patient's record. The patient can finally do the rating for each consultation they have done.

 


INSTRUCTIONS FOR SETTING-UP APPLICATION Requirements:

- [X] OS: Ubuntu 18.04 (Recommented)
- [X] NodeJs version 8.0 stable npm latest
- [X] Docker




STEPS:

1. Clone & Navigate into main directory
2. Run "sudo docker-compose up"
3. Open Browser & navigate:
   1. For Doctor-Patient Login  :   http://localhost:3000 or Ip Address- http://127.0.0.1:3000
   2. For Hospital Login 	:   http://localhost:3001 or Ip Address- http://127.0.0.1:3001
   3. For Organisation Login	:   http://localhost:3002 or Ip Address- http://127.0.0.1:3002

