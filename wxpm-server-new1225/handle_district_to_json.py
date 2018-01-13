from Configuration import ConfigParser
import pymysql
import json

class HandleAreas(object):
    config = ConfigParser()
    mysql_conn = config.get('mysql.config',key='conn')
    print(mysql_conn)
    conn = pymysql.connect(**mysql_conn)
    cursor = conn.cursor()

    def get_data(self):
        sql = 'select id,parent,name,level from wxpm.b2c_areas'
        self.cursor.execute(sql)
        datas = self.cursor.fetchall()
        print(datas)
        return datas

    def trans_to_json(self):
        '''
        #需要处理成的数据结构
        items=[
                {
                'province_id':22,
                'province_name': '山东',
                'citys': [
                            {
                            'city_name': '聊城市',
                            'city_id':291,
                            'areas': ['莘县', '阳谷县'],
                            },
                            {
                            'city_name': '济南市',
                            'city_id':283,
                            'areas': ['历下区', '市中区'],
                            }
                    ]
                }
        ]
        '''

        datas = self.get_data()
        province_dict = {data[0]:data[2] for data in datas if data[3]==1}
        #省id:名称字典
        # print(province_dict)
        citys_dict = {data[0]:data[2] for data in datas if data[3]==2}
        #市id:名称字典
        # print(citys_dict)
        province_citys = []
        citys = []
        areas = []
        for data in datas[1:len(datas)-1]:
            id = data[0]
            parent = data[1]
            name = data[2]
            level = data[3]
            #data为省记录
            if level == 1:
                item = {}
                item['province_id'] = id
                item['province_name'] = name

                item['citys'] = []
                province_citys.append(item)
            # data为市记录
            if level == 2:
                item = {}
                item['province_id'] = parent
                item['province_name'] = province_dict[parent]
                item['city_id'] = id
                item['city_name'] = name
                item['areas'] = []
                citys.append(item)
            # data为区县记录
            if level == 3:
                item = {}
                item['city_id'] = parent
                item['city_name'] = citys_dict[parent]
                item['area_id'] = id
                item['area_name'] = name
                areas.append(item)
        # print(province_citys)
        print('=====================================')
        for i in citys:
            for j in areas:
                if i['city_id'] == j['city_id']:
                    i['areas'].append({'area_id':j['area_id'],'area_name':j['area_name']})

        for i in province_citys:
            for j in citys:
                if i['province_id'] == j['province_id']:
                    i['citys'].append({'city_id': j['city_id'], 'city_name': j['city_name'], 'areas': j['areas']})


        return json.dumps(province_citys)



if __name__ == '__main__':
    handlearea = HandleAreas()
    json_data = handlearea.trans_to_json()
    print(json_data)




