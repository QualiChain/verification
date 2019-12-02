/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2019 KMi, The Open University UK                                 *
*                                                                                *
* Permission is hereby granted, free of charge, to any person obtaining          *
* a copy of this software and associated documentation files (the "Software"),   *
* to deal in the Software without restriction, including without limitation      *
* the rights to use, copy, modify, merge, publish, distribute, sublicense,       *
* and/or sell copies of the Software, and to permit persons to whom the Software *
* is furnished to do so, subject to the following conditions:                    *
*                                                                                *
* The above copyright notice and this permission notice shall be included in     *
* all copies or substantial portions of the Software.                            *
*                                                                                *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL        *
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER     *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN      *
* THE SOFTWARE.                                                                  *
*                                                                                *
**********************************************************************************/

/** Author: Michelle Bachler, KMi, The Open University **/
/** Author: Manoharan Ramachandran, KMi, The Open University **/
/** Author: Kevin Quick, KMi, The Open University **/

var mainBaseURL = "";
var routesBaseURL = "https:/ioc.kmi.open.ac.uk/";

var config = {"path":"./public/docs.html","examples":"./public/examples.txt"}

var examples = [
{
	"routeId": "30",
	"rows": [{
		"url": cfg.proxy_path+"/users/signin",
		"method": "POST",
		"request": "%7B%22username%22:%22&#60;your%20username&#62;%22,%22password%22:%22&#60;your%20password&#62;%22%7D",
		"status": 201,
		"type": "application/json",
		"response": "%7B%22token%22:%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ8.eyJ1c2VyaWQiOjE3LCJ1c2VybmFtZSI6IlJERiBTdG9yZSBUZXN0Iiwi...%22%7D",
		"id": "1"
	},{
		"url": cfg.proxy_path+"/users/signin",
		"method": "POST",
		"request": "%7B%22username%22:%22&#60;your%20username&#62;%22,%22password%22:%22&#60;your%20password&#62;%22%7D",
		"status": 401,
		"type": "application/json",
		"response": "%7B%22error%22:%22The%20username%20or%20password%20don't%20match%22%7D",
		"id": "2"
	},{
		"url": cfg.proxy_path+"/users/signin",
		"method": "POST",
		"request": "%7B%22username%22:%22&#60;your%20username&#62;%22,%22password%22:%22&#60;your%20password&#62;%22%7D",
		"status": 404,
		"type": "application/json",
		"response": "%7B%22error%22:%22An%20different%20error%20or%20message%22%7D",
		"id": "3"
	}]
}]
