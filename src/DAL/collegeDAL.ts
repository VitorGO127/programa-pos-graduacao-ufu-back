import { QueryResult } from 'pg';
import db from '../config/database';
import College from '../models/college';

export default class CollegeDAL {

    public static async createCollege(college: College): Promise<void> {
        const { name } = college;

        try {
            await db.query("INSERT INTO colleges (name, deleted) VALUES ($1, false)", [name]);
        } catch (err) {
            throw err;
        }
    }

    public static async getColleges(showDeleted: boolean = false): Promise<College[]> {
        let response: College[] = [];
        let result: QueryResult<any> | undefined;

        try {
            let query: string = 'SELECT * FROM colleges';

            if (!showDeleted) query += ' WHERE deleted = false';

            result = await db.query(query, []);

            if (result.rowCount > 0) {
                result.rows.forEach((row: any) => {
                    response.push({
                        id: row.id,
                        name: row.name,
                        deleted: row.deleted
                    });
                });
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static async getCollegeByProcessId(processId: number): Promise<College | undefined> {
        let response: College | undefined;
        let result: QueryResult<any> | undefined;

        try {
            const query: string = `SELECT c.* FROM colleges c INNER JOIN selectiveProcesses p ON p.collegeId = c.id WHERE p.id = $1`;
            const values: any[] = [processId];

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                response = {
                    id: result.rows[0].id,
                    name: result.rows[0].name,
                    deleted: result.rows[0].deleted
                }
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static async updateCollege(college: College): Promise<void> {
        const { id, name } = college;

        try {
            await db.query("UPDATE colleges SET name = $1 WHERE id = $2", [name, id]);
        } catch (err) {
            throw err;
        }
    }

    public static async deleteCollege(id: number): Promise<void> {
        try {
            await db.query("UPDATE colleges SET deleted = TRUE WHERE id = $1", [id]);
        } catch (err) {
            throw err;
        }
    }

}
