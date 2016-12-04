import * as tds from 'tedious';

var Connection = tds.Connection;
var Request = tds.Request;

interface IConnectionOptions {
    username: string;
    password: string;
    servername: string;
    database: string;
    appname: string;
}

// SqlConnection Class
export class SqlConnection {
    
    private _options: any;
    private _connection: tds.Connection;
    private _listener: any;
    
    constructor(parameters : IConnectionOptions, listener?) {
        var config = {
            userName: parameters && parameters.username,
            password: parameters && parameters.password,
            server: parameters && parameters.servername,
            options: {
                database: parameters && parameters.database,
                encrypt: true, 
                appName: parameters && parameters.appname,
                connectTimeout: 15000,
                cancelTimeout: 5000,
                requestTimeout: 0,
                packetSize: 8000
            },    
        };
        
        this._options = config;
        this._listener = (listener !== undefined) ? listener : new ConsoleErrorOutput();
    }
    
    async open() {
        let listener = this._listener; 

        return new Promise<void>( (resolve, reject)=>{
            this.openWithCallback( 
                listener,
                (err) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
        });
    }

    private openWithCallback(listener, done) {
        var connection = new Connection(this._options);
        
        connection.on('infoMessage', function(e) {
            listener && listener.reportInfo && listener.reportInfo(e);
        });
        connection.on('errorMessage', function(e) {
            listener && listener.reportError && listener.reportError(e);
        });

        connection.on('end', function(err) {
            // console.log('end');
        });

        // critical error: failures with unknown reasons 
        connection.on('error', function(err) {
            done('critical error',this);
        });
        
        connection.on('connect', function(err) {
            done(err, this);
        });

        this._connection = connection;
        
        return this;        
    }
    
    close() {
        if(this._connection) {
            this._connection.close();
            this._connection = null;
        }
    }

    async execute(sql_request: string) {

        var listener = this._listener;
        
        return new Promise<void>( (resolve,reject)=>{
            this.executeWithDone(sql_request, 
                listener.progressHeader.bind(listener), 
                listener.progressRow.bind(listener), 
                function(err) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve();
                    }                    
                })    
        });
    }   
    
    executeWithDone(sql_batch, progress_header, progress_row, done) {
        
        var connection = this._connection;
        
        var request = new Request(sql_batch, function(err, rowCount) {
            done && done(err);        
            });

        request.on('columnMetadata', function(columns) {

            // project only the required data
            var columnOutput = columns.map(function(elem, i) {
                var header = {
                    index: i,
                    name: elem.colName,
                    size: elem.dataLength,
                    type: elem.type.type
                };
                return header;
            });

            // create the inverted index
            columns.map(function(elem, i) {
                // add column name only if it is not empty  
                (elem.colName.length > 0) && (columnOutput[elem.colName] = columnOutput[i]);                
            });
            
            progress_header && progress_header(columnOutput);
                
        });
        request.on('row', function(columns) {
            
            var columnOutput = columns.map(function(elem) {
                return elem.value;
                //return (elem.value instanceof Uint8Array) ? getArray(elem.value) : elem.value;
            })

            progress_row && progress_row(columnOutput);
                    
            // function getArray(arr) {
            //     var p = '0x';
            //     var b = arr.reduce(function(prev,cur) {
            //     var hex = cur.toString(16);
            //     hex = (hex.length == 1) ? '0' + hex : hex;
            //     
            //     return prev + hex; 
            //     });
            //     return p + b;
            // }
            
        });
        
        connection.execSql(request);    
    }    
}

// function getConnection(parameters, done) {
    
//     var conn = new SqlConnection(parameters);

//     done(parameters == null ? new Error("fail") : null);
    
//     return conn;
// }

// function getConnection2(parameters, done) {

//     var config = {
//         userName: (parameters && parameters.username) || process.env.SQLSERVER_USER,
//         password: (parameters && parameters.password) || process.env.SQLSERVER_PWD,
//         server: (parameters && parameters.servername) || process.env.SQLSERVER_SRV,
//         options: {
//             database: (parameters && parameters.database) || process.env.SQLSERVER_DB,
//             encrypt: true, 
//             appName: 'SuperConn',
//             //connectTimeout
//             //cancelTimeout
//             requestTimeout: 0,
//             packetSize: 8000
//         },    
//     };

//     var connection = new Connection(config);

//     connection.on('infoMessage', function(e) {
//         console.log('infoMessage'); 
//         console.log(e); 
//     });
//     connection.on('errorMessage', function(e) {
        
//         // errors: https://azure.microsoft.com/pt-br/documentation/articles/sql-database-develop-error-messages/
//         // error 40615,14,1
//         // Cannot open server 'xxxxxxx' requested by the login. 
//         // Client with IP address 'xx.xx.xx.xxx' is not allowed to access the server.  
//         // To enable access, use the Windows Azure Management Portal or 
//         // run sp_set_firewall_rule on the master database to create a firewall rule 
//         // for this IP address or address range. 
//         // It may take up to five minutes for this change to take effect.
        
//         // error message : 18456,14,1
//         // Login failed for user 'fcatae'.
        
//         console.log('errorMessage'); 
//         console.log(e); 
//     });

//     connection.on('end', function(e) {
//         // TODO: handle persistent connection
//         console.log('end'); 
//         console.log(e); 
//     });
//     connection.on('error', function(e) {
//         // TODO: handle persistent connection
//         console.log('error'); 
//         console.log(e); 
//     });
//     connection.on('connect', function(err) {
//         console.log('connect'); 

//         (err) && console.log(err.message);
//         done(err && err.message, connection);
        
//     });

//     return connection;
// }

// function execute(connection, sqlcmd, progress, done) {
    
//     var request = new Request(sqlcmd, function(err, rowCount) {
//         console.dir(err);
//         console.log('executed: ' + rowCount )
//         done && done();        
//         });

//     request.on('columnMetadata', function(c) {
//         //console.dir(c);

//         var a = c.map(function(elem) {
//             var header = {
//                 name: elem.colName,
//                 rawLength: elem.dataLength,
//                 type: elem.type.type,
//                 typeSize: elem.type.maximumLength
//             };
//             return header.name;
//         });
        
//         progress && progress(a);
//         // flatten
//         //_.map(function(col) {})
            
//     });
//     request.on('row', function(c) {
//         //console.dir(c);
        
//         var a = c.map(function(elem) {
//             return (elem.value instanceof Uint8Array) ? getArray(elem.value) : elem.value;
//         })

//         progress && progress(a);
                
//         function getArray(arr) {
//             var p = '0x';
//             var b = arr.reduce(function(prev,cur) {
//                var hex = cur.toString(16);
//                hex = (hex.length == 1) ? '0' + hex : hex;
               
//                return prev + hex; 
//             });
//             return p + b;
//         }
        
//     });
//     request.on('done', function(c) {
//         console.log('done');    
//     });
//     request.on('doneProc', function(c) {
//         console.log('doneProc');    
//     });
    
//     connection.execSql(request);    
// }


// class RowOutput
class RowOutput {
    header = [];
    rows = [];
    
    progressHeader(header) {
        this.header = header;
    }
    
    progressRow(row) {
        this.rows.push(row);
    }
} 

interface IErrorOutput {
    reportInfo(info) : void;
    reportError(error) : void;
}

// class ErrorOutput
class ErrorOutput {
    _infoMessages = [];
    _errorMessages = [];
    
    reportInfo(info) {
        this._infoMessages.push(info.message);     
    }
    reportError(error) {
        this._errorMessages.push(error);
    }
    get info() {
        return this._infoMessages.join('\n');
    }
    get errors() {
        return this._errorMessages;
    }
}

class ConsoleErrorOutput {
    reportInfo(info) {
        //console.log('infoMessage'); 
        //console.log(info);     
    }
    reportError(error) {
        console.log('errorMessage'); 
        console.log(error); 
    }
}

