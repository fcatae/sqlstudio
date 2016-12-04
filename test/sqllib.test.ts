import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sql from '../src/sqllib';

suite("SQLLib Tests", () => {
    
    test("SQL_Open", () => {
        let connection = new sql.SqlConnection({
            username: 'sql', password: 'sql',
            appname: 'test',
            servername: null, database: null 
        });

        let deferred = connection.open().then((err)=>{
            connection.close();
            assert.equal(err, null);
        });

        return deferred;
    });

    test("SQL_Open: Wrong password", () => {
        let silentListener = null;
        let connection = new sql.SqlConnection({
            username: 'sql', password: '--invalid--',
            appname: 'test',
            servername: null, database: null 
        }, silentListener);

        let deferred = connection.open().then( ()=>{
            assert(false, 'connection should fail with wrong password');
        }).catch( (err)=>{
        })

        return deferred;
    });    
});