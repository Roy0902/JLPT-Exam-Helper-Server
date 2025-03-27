import pool from '../config/database.js';

class item {

  async getLearningItemBySubtopicID(subtopic_id_list, connection = pool) {
    const [rows] = await connection.execute(
    `SELECT 
     i.subtopic_id, c.category_name, COUNT(i.item_id) AS item_count FROM items i
     JOIN categories c ON i.category_id = c.category_id
     WHERE i.subtopic_id IN (?)
     GROUP BY i.subtopic_id, c.category_name;` ,
     [subtopic_id_list]
    );

    return rows;
  }

  async getLearningItemFeatureBySubtopicID(subtopic_id_list, connection = pool) {
    const [rows] = await connection.execute(
    `SELECT i.item_id, i.subtopic_id, c.category_name, l.level_name FROM items i
     JOIN categories c ON i.category_id = c.category_id
     JOIN subtopics s ON i.subtopic_id = s.subtopic_id
     JOIN levels l ON s.level_id = l.level_id
     WHERE i.subtopic_id IN (?)` ,
     [subtopic_id_list]
    );

    return rows;
  }


}

export default new item();