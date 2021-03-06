import instance from '../lib/filedb';
import * as Sequelize from 'sequelize';

const fmodel = instance.define('mediafiles',{
    title: {
        type: Sequelize.STRING,
        unique: true,
    },
    
    time: {
        type: Sequelize.STRING,
        defaultValue: '1970-01-01T00:00:00Z',//ISO 8601
    },
    
    author: {
        type: Sequelize.STRING,
        defaultValue: 'unknown'
    }, 
    
    description: {
        type: Sequelize.STRING,
        defaultValue: 'N/A',
    },
    
    url: {
        type: Sequelize.STRING,
        unique: true,
    }, 

    size: Sequelize.INTEGER, // KB
     
    /*hash value of the first blob of a file*/
    hash: {
        type: Sequelize.STRING, 
        unique: true,
    },
});

instance.sync();

export default fmodel;