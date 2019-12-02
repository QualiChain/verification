#verification

Repository contents
-----------------------------------------------------------------------
The Repository holds the Express NodeJS framework that the Open University (OU) team developed to test and run the blockchain-based verification component. This component requires a fully operational blockchain, an IPFS and a database. The OU provides an ethereum parity blockchain with three nodes to ensure Byzantine Fault Tolerance (BFT) along with other required elements to make this component work. Those source code is not included in this repository. Sensitive information such as databased password etc. in the configuration files are also deliberately omitted.    


The component
-----------------------------------------------------------------------
The component takes a badge as input and verifies the qualification by checking with the IPFS and the blockchain. The Express NodeJS framework acts as the application that stays between the blockchain and backend servers/databases and verifies the qualification in question. In addition to the badge in question, the component also requires the email address of the student. The badge and the email addressed must be tied up at the time of the issuing process. In this version,  a badge is issued by the developer and made available to demonstrate the testing process. In future, there will be a separate section to issue badge/qualification by issuing authority. 


Testing the component
-----------------------------------------------------------------------
Because the component requires a fully functional blockchain along with other auxiliary elements, making the source code run is strenuous and challenging. To demonstrate the functionalities of the component, the OU team made this Express NodeJS application run on a live server. 

Verification steps:
1. For the purpose of verifying a qualification, a sample badge is issued and provided in the badge folder. This badge needs to be downloaded before initiating the verification process.
2. Visit this URL to access the verification page: https://blockchain21.kmi.open.ac.uk/qualichain/
3. Click on the `Validate a Badge'.
4. Upload the badge file.
5. Use the following as student's email address: michelle.bachler@open.ac.uk
6. The web application velidates the badge and shows the obtained output.

There is another button available called `Issued Badges'. It lists all the issued badge using this system. 
