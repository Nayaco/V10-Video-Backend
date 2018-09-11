import instance from '../lib/filedb';
import * as Sequelize from 'sequelize';

const umodel = instance.define('mediafiles',{
    name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'empty name do\'nt allowed'
            }
        },
    },
    
    time: {
        type: Sequelize.DATE,
        defaultValue: new Date('2018-01-01 00:00:00.000'),// ISO 8601
    }, 
    
    description: {
        type: Sequelize.STRING,
        defaultValue: 'N/A',
    },
    
    passwd: {
        type: Sequelize.STRING, // password (sha-256) 
        unique: true,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'empty password do\'nt allowed'
            }
        }
    },
    
    stuid: {
        type: Sequelize.STRING,
        unique: true,
        defaultValue: 'N/A',
    }
});

instance.sync();

export default umodel;
