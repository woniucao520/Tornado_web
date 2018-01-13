# coding:utf8
import json
from Configuration import ConfigParser
import pymysql


class AreasJsonTest(object):
    config = ConfigParser()
    mysql_conn = config.get('mysql.config',key='conn')
    print(mysql_conn)
    conn = pymysql.connect(**mysql_conn)
    cursor = conn.cursor()

    # 连接数据库
    def get_b2c_areas_data(self):
        sql = 'select id,parent,name,level from wxpm.b2c_areas '
        self.cursor.execute(sql)
        datas = self.cursor.fetchall()
        print(datas)
        self.trans_dates_to_json(datas)
        return datas


    def trans_dates_to_json(self,datas):
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
        # 第一层,将省（level 1给筛选出来）
        province_lists = []
        for data in datas:
            first_province = {}
            if data[3] ==1:
                first_province['province_id'] = data[0]
                first_province['province_name']= data[2]
                first_province['citys'] = []
                province_lists.append(first_province)

        print(province_lists)

        #第二层，将省对应的市（筛选出来）
        second_citys_lists = []
        for data in datas:
            if data[3] == 2:
                second_citys={}
                second_citys['city_id'] = data[0]
                second_citys['p_id'] = data[1]
                second_citys['city_name'] = data[2]
                second_citys['districts'] = []
                second_citys_lists.append(second_citys)
        print (second_citys_lists)

        # 第三步，将省下对应的城市，添加到citys[]里面
        for province_list in province_lists:
            for second_citys_list in second_citys_lists:
                if province_list['province_id'] == second_citys_list['p_id']:
                    province_list['citys'].append(second_citys_list)
        print("将城市添加到citys里")
        print(province_lists)
        for i in province_lists:
            print(i)

        # 第四步，获取市下面的县，镇或者区
        districts_lists = []
        for data in datas:
            if data[3] == 3:
                districts_areas = {}
                districts_areas['districts_id'] = data[0]
                districts_areas['districts_p_id'] = data[1]
                districts_areas['districts_name'] = data[2]
                districts_lists.append(districts_areas)


        # 将县，区添加到对应的市里面
        for second_citys_list in second_citys_lists:
            for districts_list in districts_lists:
                if second_citys_list['city_id'] == districts_list['districts_p_id']:
                    second_citys_list['districts'].append({'districts_id':districts_list['districts_id'],'districts_name':districts_list['districts_name']})

        print('++++++++++++++++++++++++++++++++++')

        for i in province_lists:
            print (i)










if __name__ == '__main__':
    handlearea = AreasJsonTest()
    handlearea.get_b2c_areas_data()
