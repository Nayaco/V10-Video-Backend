import instance from '../lib/fileinfo';
import * as Sequelize from 'sequelize';

export default instance.define('mediafiles',{
    UUID: {
      type: Sequelize.STRING,
      primaryKey: true, 
    },

    title: {
        type: Sequelize.STRING,
        unique: true,
    },
    
    time: {
        type: Sequelize.STRING,
        defaultValue: '1970-01-01T00:00:00Z',//ISO 8601
    },
    
    author: Sequelize.STRING, 
    
    url: {
        type: Sequelize.STRING,
        unique: true,
    }, 

    size: Sequelize.INTEGER,
     
    /*hash value of the first blob of a file*/
    hash: {
        type: Sequelize.STRING, 
        unique: true,
    },
});
