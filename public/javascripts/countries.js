/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2020 KMi, The Open University UK                                 *
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
// updated 27/11/2019

var COUNTRIES_LIST = {};

COUNTRIES_LIST['AF'] = 'Afghanistan';
COUNTRIES_LIST['AX'] = 'Åland Islands';
COUNTRIES_LIST['AL'] = 'Albania';
COUNTRIES_LIST['DZ'] = 'Algeria';
COUNTRIES_LIST['AS'] = 'American Samoa';
COUNTRIES_LIST['AD'] = 'Andorra';
COUNTRIES_LIST['AO'] = 'Angola';
COUNTRIES_LIST['AI'] = 'Anguilla';
COUNTRIES_LIST['AQ'] = 'Antarctica';
COUNTRIES_LIST['AG'] = 'Antigua And Barbuda';
COUNTRIES_LIST['AR'] = 'Argentina';
COUNTRIES_LIST['AM'] = 'Armenia';
COUNTRIES_LIST['AW'] = 'Aruba';
COUNTRIES_LIST['AU'] = 'Australia';
COUNTRIES_LIST['AT'] = 'Austria';
COUNTRIES_LIST['AZ'] = 'Azerbaijan';
COUNTRIES_LIST['BS'] = 'Bahamas';
COUNTRIES_LIST['BH'] = 'Bahrain';
COUNTRIES_LIST['BD'] = 'Bangladesh';
COUNTRIES_LIST['BB'] = 'Barbados';
COUNTRIES_LIST['BY'] = 'Belarus';
COUNTRIES_LIST['BE'] = 'Belgium';
COUNTRIES_LIST['BZ'] = 'Belize';
COUNTRIES_LIST['BJ'] = 'Benin';
COUNTRIES_LIST['BM'] = 'Bermuda';
COUNTRIES_LIST['BT'] = 'Bhutan';
COUNTRIES_LIST['BO'] = 'Bolivia, Plurinational State Of';
COUNTRIES_LIST['BQ'] = 'Bonaire, Sint Eustatius and Saba';
COUNTRIES_LIST['BA'] = 'Bosnia And Herzegovina';
COUNTRIES_LIST['BW'] = 'Botswana';
COUNTRIES_LIST['BV'] = 'Bouvet Island';
COUNTRIES_LIST['BR'] = 'Brazil';
COUNTRIES_LIST['IO'] = 'British Indian Ocean Territory';
COUNTRIES_LIST['BN'] = 'Brunei Darussalam';
COUNTRIES_LIST['BG'] = 'Bulgaria';
COUNTRIES_LIST['BF'] = 'Burkina Faso';
COUNTRIES_LIST['BI'] = 'Burundi';
COUNTRIES_LIST['CV'] = 'Cabo Verde';
COUNTRIES_LIST['KH'] = 'Cambodia';
COUNTRIES_LIST['CM'] = 'Cameroon';
COUNTRIES_LIST['CA'] = 'Canada';
COUNTRIES_LIST['KY'] = 'Cayman Islands';
COUNTRIES_LIST['CF'] = 'Central African Republic';
COUNTRIES_LIST['TD'] = 'Chad';
COUNTRIES_LIST['CL'] = 'Chile';
COUNTRIES_LIST['CN'] = 'China';
COUNTRIES_LIST['CX'] = 'Christmas Island';
COUNTRIES_LIST['CC'] = 'Cocos (Keeling) Islands';
COUNTRIES_LIST['CO'] = 'Colombia';
COUNTRIES_LIST['KM'] = 'Comoros';
COUNTRIES_LIST['CG'] = 'Congo';
COUNTRIES_LIST['CD'] = 'Congo, The Democratic Republic Of The';
COUNTRIES_LIST['CK'] = 'Cook Islands';
COUNTRIES_LIST['CR'] = 'Costa Rica';
COUNTRIES_LIST['CI'] = 'Côte D\'Ivoire';
COUNTRIES_LIST['HR'] = 'Croatia';
COUNTRIES_LIST['CU'] = 'Cuba';
COUNTRIES_LIST['CY'] = 'Cyprus';
COUNTRIES_LIST['CZ'] = 'Czech Republic';
COUNTRIES_LIST['DK'] = 'Denmark';
COUNTRIES_LIST['DJ'] = 'Djibouti';
COUNTRIES_LIST['DM'] = 'Dominica';
COUNTRIES_LIST['DO'] = 'Dominican Republic';
COUNTRIES_LIST['EC'] = 'Ecuador';
COUNTRIES_LIST['EG'] = 'Egypt';
COUNTRIES_LIST['SV'] = 'El Salvador';
COUNTRIES_LIST['GQ'] = 'Equatorial Guinea';
COUNTRIES_LIST['ER'] = 'Eritrea';
COUNTRIES_LIST['EE'] = 'Estonia';
COUNTRIES_LIST['SZ'] = 'Eswatini';
COUNTRIES_LIST['ET'] = 'Ethiopia';
COUNTRIES_LIST['FK'] = 'Falkland Islands (Malvinas)';
COUNTRIES_LIST['FO'] = 'Faroe Islands';
COUNTRIES_LIST['FJ'] = 'Fiji';
COUNTRIES_LIST['FI'] = 'Finland';
COUNTRIES_LIST['FR'] = 'France';
COUNTRIES_LIST['GF'] = 'French Guiana';
COUNTRIES_LIST['PF'] = 'French Polynesia';
COUNTRIES_LIST['TF'] = 'French Southern Territories';
COUNTRIES_LIST['GA'] = 'Gabon';
COUNTRIES_LIST['GM'] = 'Gambia';
COUNTRIES_LIST['GE'] = 'Georgia';
COUNTRIES_LIST['DE'] = 'Germany';
COUNTRIES_LIST['GH'] = 'Ghana';
COUNTRIES_LIST['GI'] = 'Gibraltar';
COUNTRIES_LIST['GR'] = 'Greece';
COUNTRIES_LIST['GL'] = 'Greenland';
COUNTRIES_LIST['GD'] = 'Grenada';
COUNTRIES_LIST['GP'] = 'Guadeloupe';
COUNTRIES_LIST['GU'] = 'Guam';
COUNTRIES_LIST['GT'] = 'Guatemala';
COUNTRIES_LIST['GG'] = 'Guernsey';
COUNTRIES_LIST['GN'] = 'Guinea';
COUNTRIES_LIST['GW'] = 'Guinea-Bissau';
COUNTRIES_LIST['GY'] = 'Guyana';
COUNTRIES_LIST['HT'] = 'Haiti';
COUNTRIES_LIST['HM'] = 'Heard Island And Mcdonald Islands';
COUNTRIES_LIST['VA'] = 'Holy See (Vatican City State)';
COUNTRIES_LIST['HN'] = 'Honduras';
COUNTRIES_LIST['HK'] = 'Hong Kong';
COUNTRIES_LIST['HU'] = 'Hungary';
COUNTRIES_LIST['IS'] = 'Iceland';
COUNTRIES_LIST['IN'] = 'India';
COUNTRIES_LIST['ID'] = 'Indonesia';
COUNTRIES_LIST['IR'] = 'Iran, Islamic Republic Of';
COUNTRIES_LIST['IQ'] = 'Iraq';
COUNTRIES_LIST['IE'] = 'Ireland';
COUNTRIES_LIST['IM'] = 'Isle Of Man';
COUNTRIES_LIST['IL'] = 'Israel';
COUNTRIES_LIST['IT'] = 'Italy';
COUNTRIES_LIST['JM'] = 'Jamaica';
COUNTRIES_LIST['JP'] = 'Japan';
COUNTRIES_LIST['JE'] = 'Jersey';
COUNTRIES_LIST['JO'] = 'Jordan';
COUNTRIES_LIST['KZ'] = 'Kazakhstan';
COUNTRIES_LIST['KE'] = 'Kenya';
COUNTRIES_LIST['KI'] = 'Kiribati';
COUNTRIES_LIST['KP'] = 'Korea, Democratic People\'s Republic Of';
COUNTRIES_LIST['KR'] = 'Korea, Republic Of';
COUNTRIES_LIST['KW'] = 'Kuwait';
COUNTRIES_LIST['KG'] = 'Kyrgyzstan';
COUNTRIES_LIST['LA'] = 'Lao People\'s Democratic Republic';
COUNTRIES_LIST['LV'] = 'Latvia';
COUNTRIES_LIST['LB'] = 'Lebanon';
COUNTRIES_LIST['LS'] = 'Lesotho';
COUNTRIES_LIST['LR'] = 'Liberia';
COUNTRIES_LIST['LY'] = 'Libya';
COUNTRIES_LIST['LI'] = 'Liechtenstein';
COUNTRIES_LIST['LT'] = 'Lithuania';
COUNTRIES_LIST['LU'] = 'Luxembourg';
COUNTRIES_LIST['MO'] = 'Macao';
COUNTRIES_LIST['MG'] = 'Madagascar';
COUNTRIES_LIST['MW'] = 'Malawi';
COUNTRIES_LIST['MY'] = 'Malaysia';
COUNTRIES_LIST['MV'] = 'Maldives';
COUNTRIES_LIST['ML'] = 'Mali';
COUNTRIES_LIST['MT'] = 'Malta';
COUNTRIES_LIST['MH'] = 'Marshall Islands';
COUNTRIES_LIST['MQ'] = 'Martinique';
COUNTRIES_LIST['MR'] = 'Mauritania';
COUNTRIES_LIST['MU'] = 'Mauritius';
COUNTRIES_LIST['YT'] = 'Mayotte';
COUNTRIES_LIST['MX'] = 'Mexico';
COUNTRIES_LIST['FM'] = 'Micronesia, Federated States Of';
COUNTRIES_LIST['MD'] = 'Moldova, Republic Of';
COUNTRIES_LIST['MC'] = 'Monaco';
COUNTRIES_LIST['MN'] = 'Mongolia';
COUNTRIES_LIST['ME'] = 'Montenegro';
COUNTRIES_LIST['MS'] = 'Montserrat';
COUNTRIES_LIST['MA'] = 'Morocco';
COUNTRIES_LIST['MZ'] = 'Mozambique';
COUNTRIES_LIST['MM'] = 'Myanmar';
COUNTRIES_LIST['NA'] = 'Namibia';
COUNTRIES_LIST['NR'] = 'Nauru';
COUNTRIES_LIST['NP'] = 'Nepal';
COUNTRIES_LIST['NL'] = 'Netherlands';
COUNTRIES_LIST['NC'] = 'New Caledonia';
COUNTRIES_LIST['NZ'] = 'New Zealand';
COUNTRIES_LIST['NI'] = 'Nicaragua';
COUNTRIES_LIST['NE'] = 'Niger';
COUNTRIES_LIST['NG'] = 'Nigeria';
COUNTRIES_LIST['NU'] = 'Niue';
COUNTRIES_LIST['NF'] = 'Norfolk Island';
COUNTRIES_LIST['MK'] = 'North Macedonia';
COUNTRIES_LIST['MP'] = 'Northern Mariana Islands';
COUNTRIES_LIST['NO'] = 'Norway';
COUNTRIES_LIST['OM'] = 'Oman';
COUNTRIES_LIST['PK'] = 'Pakistan';
COUNTRIES_LIST['PW'] = 'Palau';
COUNTRIES_LIST['PS'] = 'Palestinian, State of';
COUNTRIES_LIST['PA'] = 'Panama';
COUNTRIES_LIST['PG'] = 'Papua New Guinea';
COUNTRIES_LIST['PY'] = 'Paraguay';
COUNTRIES_LIST['PE'] = 'Peru';
COUNTRIES_LIST['PH'] = 'Philippines';
COUNTRIES_LIST['PN'] = 'Pitcairn';
COUNTRIES_LIST['PL'] = 'Poland';
COUNTRIES_LIST['PT'] = 'Portugal';
COUNTRIES_LIST['PR'] = 'Puerto Rico';
COUNTRIES_LIST['QA'] = 'Qatar';
COUNTRIES_LIST['RE'] = 'Réunion';
COUNTRIES_LIST['RO'] = 'Romania';
COUNTRIES_LIST['RU'] = 'Russian Federation';
COUNTRIES_LIST['RW'] = 'Rwanda';
COUNTRIES_LIST['BL'] = 'Saint Barthélemy';
COUNTRIES_LIST['SH'] = 'Saint Helena, Ascension and Tristan da Cunha';
COUNTRIES_LIST['KN'] = 'Saint Kitts And Nevis';
COUNTRIES_LIST['LC'] = 'Saint Lucia';
COUNTRIES_LIST['MF'] = 'Saint Martin (French Part)';
COUNTRIES_LIST['PM'] = 'Saint Pierre And Miquelon';
COUNTRIES_LIST['VC'] = 'Saint Vincent And The Grenadines';
COUNTRIES_LIST['WS'] = 'Samoa';
COUNTRIES_LIST['SM'] = 'San Marino';
COUNTRIES_LIST['ST'] = 'Sao Tome And Principe';
COUNTRIES_LIST['SA'] = 'Saudi Arabia';
COUNTRIES_LIST['SN'] = 'Senegal';
COUNTRIES_LIST['RS'] = 'Serbia';
COUNTRIES_LIST['SC'] = 'Seychelles';
COUNTRIES_LIST['SL'] = 'Sierra Leone';
COUNTRIES_LIST['SG'] = 'Singapore';
COUNTRIES_LIST['SX'] = 'Sint Maarten (Dutch Part)';
COUNTRIES_LIST['SK'] = 'Slovakia';
COUNTRIES_LIST['SI'] = 'Slovenia';
COUNTRIES_LIST['SB'] = 'Solomon Islands';
COUNTRIES_LIST['SO'] = 'Somalia';
COUNTRIES_LIST['ZA'] = 'South Africa';
COUNTRIES_LIST['GS'] = 'South Georgia And The South Sandwich Islands';
COUNTRIES_LIST['SS'] = 'Sounth Sudan';
COUNTRIES_LIST['ES'] = 'Spain';
COUNTRIES_LIST['LK'] = 'Sri Lanka';
COUNTRIES_LIST['SD'] = 'Sudan';
COUNTRIES_LIST['SR'] = 'Suriname';
COUNTRIES_LIST['SJ'] = 'Svalbard And Jan Mayen';
COUNTRIES_LIST['SE'] = 'Sweden';
COUNTRIES_LIST['CH'] = 'Switzerland';
COUNTRIES_LIST['SY'] = 'Syrian Arab Republic';
COUNTRIES_LIST['TW'] = 'Taiwan, Province Of China';
COUNTRIES_LIST['TJ'] = 'Tajikistan';
COUNTRIES_LIST['TZ'] = 'Tanzania, United Republic Of';
COUNTRIES_LIST['TH'] = 'Thailand';
COUNTRIES_LIST['TL'] = 'Timor-Leste';
COUNTRIES_LIST['TG'] = 'Togo';
COUNTRIES_LIST['TK'] = 'Tokelau';
COUNTRIES_LIST['TO'] = 'Tonga';
COUNTRIES_LIST['TT'] = 'Trinidad And Tobago';
COUNTRIES_LIST['TN'] = 'Tunisia';
COUNTRIES_LIST['TR'] = 'Turkey';
COUNTRIES_LIST['TM'] = 'Turkmenistan';
COUNTRIES_LIST['TC'] = 'Turks And Caicos Islands';
COUNTRIES_LIST['TV'] = 'Tuvalu';
COUNTRIES_LIST['UG'] = 'Uganda';
COUNTRIES_LIST['UA'] = 'Ukraine';
COUNTRIES_LIST['AE'] = 'United Arab Emirates';
COUNTRIES_LIST['GB'] = 'United Kingdom';
COUNTRIES_LIST['US'] = 'United States';
COUNTRIES_LIST['UM'] = 'United States Minor Outlying Islands';
COUNTRIES_LIST['UY'] = 'Uruguay';
COUNTRIES_LIST['UZ'] = 'Uzbekistan';
COUNTRIES_LIST['VU'] = 'Vanuatu';
COUNTRIES_LIST['VE'] = 'Venezuela, Bolivarian Republic Of';
COUNTRIES_LIST['VN'] = 'Viet Nam';
COUNTRIES_LIST['VG'] = 'Virgin Islands, British';
COUNTRIES_LIST['VI'] = 'Virgin Islands, U.S.';
COUNTRIES_LIST['WF'] = 'Wallis And Futuna';
COUNTRIES_LIST['EH'] = 'Western Sahara';
COUNTRIES_LIST['YE'] = 'Yemen';
COUNTRIES_LIST['ZM'] = 'Zambia';
COUNTRIES_LIST['ZW'] = 'Zimbabwe';

var DEFAULT_COUNTRY = COUNTRIES_LIST['GB'];
