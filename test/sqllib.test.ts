import * as assert from 'assert';
import * as vscode from 'vscode';
import { SqlConnection, getConnection } from '../src/sqllib';

suite("SQLLib Tests", () => {

    // Defines a Mocha unit test
    test("connect", () => {
        var conn = getConnection({ username: 'sql', password: 'sql'}, () => {

        });
        conn.open( () => {
            console.log('open');            
        });

        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});