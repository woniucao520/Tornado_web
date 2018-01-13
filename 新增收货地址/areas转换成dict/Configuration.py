import os
import sys
import yaml

class ConfigParser(object):

    config_file = os.path.dirname(os.path.realpath(__file__)) + '/config.yaml'
    conns = yaml.load(open(config_file,'r'))

    @classmethod
    def get(cls, server='mysql.config', key='local'):
        if not cls.conns:
            cls.conns = yaml.load(open(cls.config_file, 'r'))

        section = cls.conns.get(server, None)
        if server.startswith('mysql'):
            if section is None:
                raise NotImplementedError
            value = section.get(key, None)
            if value is None:
                raise NotImplementedError
            return value
        else:
            return section



