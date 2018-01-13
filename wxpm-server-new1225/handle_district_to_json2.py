from Configuration import ConfigParser
import pymysql
import json
'''
class HandleAreas(object):
    config = ConfigParser()
    mysql_conn = config.get(key='conn')
    conn = pymysql.connect(**mysql_conn)
    cursor = conn.cursor()

    def get_rows(self):
        sql = 'select id,parent,name,level from wxpm.b2c_areas'
        self.cursor.execute(sql)
        rows = self.cursor.fetchall()
        return rows

    def trans_to_json(self):
        rows = self.get_rows()
        province_dict = {row[0]:row[2] for row in rows if row[3]==1}
        #省id:名称字典
        print(province_dict)
        citys_dict = {row[0]:row[2] for row in rows if row[3]==2}
        #市id:名称字典
        print(citys_dict)
        province_citys = []
        citys = []
        areas = []
        for row in rows[1:len(rows)-1]:
            id = row[0]
            parent = row[1]
            name = row[2]
            level = row[3]
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
        print(province_citys)
        print('=====================================')
        for i in citys:
            for j in areas:
                if i['city_id'] == j['city_id']:
                    i['areas'].append(j['area_name'])

        for i in province_citys:
            for j in citys:
                if i['province_id'] == j['province_id']:
                    city_item = {'city_id': j['city_id'], 'city_name': j['city_name'], 'areas': j['areas']}
                    i['citys'].append(city_item)

        for i in province_citys:
            print(i)
        return json.dumps(province_citys)

if __name__ == '__main__':
    handleareas = HandleAreas()
    json_data = handleareas.trans_to_json()
    print(json_data)

from Configuration import ConfigParser
import pymysql
import json
'''
class HandleAreas(object):
    config = ConfigParser()
    mysql_conn = config.get('mysql.config',key='conn')
    conn = pymysql.connect(**mysql_conn)
    cursor = conn.cursor()

    def get_rows(self):
        sql = 'select province_id,province,city_id,city,group_concat(area) as areas from (select a.id as province_id,a.name as province,b.id as city_id,b.name as city,c.id as area_id,c.name as area from b2c_areas as a left join b2c_areas as b on a.id=b.parent left join b2c_areas as c on b.id=c.parent where a.level in (1,2) order by a.id,b.id) as a where a.province_id <= (select max(id) from b2c_areas where level=1) group by province_id,province,city_id,city'
        self.cursor.execute(sql)
        rows = self.cursor.fetchall()
        return rows

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
        '''
        #rows为元祖套元祖的结构 >>>>>(())
        rows = ((2, '北京', 52, '北京', '房山区,门头沟区,通州区,顺义区,昌平区,怀柔区,平谷区,大兴区,密云县,延庆县,东城区,西城区,海淀区,朝阳区,崇文区,宣武区,丰台区,石景山区'), (3, '安徽', 36, '安庆', '迎江区,大观区,宜秀区,桐城市,怀宁县,枞阳县,潜山县,太湖县,宿松县,望江县,岳西县'))
        
        '''
        rows = self.get_rows()
        #得到去重以后的省市列表 共计34个元祖 [(id:province_name),(id:province_name)]
        provinces = list(set([(row[0],row[1])for row in rows]))
        #根据省id升序排序
        provinces = sorted(provinces,key=lambda data:data[0] )
        #将上面列表里的元祖转换为字典 添加keys值  province_id,province_name,citys 且citys的值为空列表
        province_items= [{'province_id':data[0],'province_name':data[1],'citys':[] } for data in provinces]
        #遍历每一条数据
        for row in rows:
            #省id
            province_id = row[0]
            #省名称
            province_name = row[1]
            #市id
            city_id= row[2]
            #市名称
            city_name = row[3]
            #区域列表 为空值
            areas = row[4].split(',') if row[4] else []
            #对省字典列表进行遍历 根据省id是否相等  citys对应的空列表 将城市及下属区域列表添加进去
            for province_item in province_items:
                if province_id == province_item['province_id']:
                    city_item = {
                        'city_name': city_name,
                        'city_id': city_id,
                        'areas': areas,
                    }
                    province_item['citys'].append(city_item)
        for province_item in province_items:
            print(province_item)

        return json.dumps(province_items)

if __name__ == '__main__':
    handleareas = HandleAreas()
    json_data = handleareas.trans_to_json()
    print(json_data)







