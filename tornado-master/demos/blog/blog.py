# coding:utf-8
#!/usr/bin/env python
#
# Copyright 2009 Facebook
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

import bcrypt
import concurrent.futures
import MySQLdb

import markdown
import os.path
import re
import subprocess
import torndb
import tornado.escape
from tornado import gen
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import unicodedata

from tornado.options import define, options
# 定义的连接接口，数据库的连接信息，端口信息
# docker-compose.yml 里数据库的配置信息
define("port", default=8888, help="run on the given port", type=int)
define("mysql_host", default="127.0.0.1:3306", help="blog database host")
define("mysql_database", default="blog", help="blog database name")
define("mysql_user", default="blog", help="blog database user")
define("mysql_password", default="blog", help="blog database password")


# A thread pool to be used for password hashing with bcrypt.
executor = concurrent.futures.ThreadPoolExecutor(2)    # 实现异步调用

# 定义Application信息，它是继承tornado.web.Application
class Application(tornado.web.Application):
    # __init__函数自动调用
    def __init__(self):
        # handler 处理逻辑的函数
        handlers = [
            (r"/", HomeHandler),
            (r"/archive", ArchiveHandler),
            (r"/feed", FeedHandler),
            (r"/entry/([^/]+)", EntryHandler),
            (r"/compose", ComposeHandler),
            (r"/auth/create", AuthCreateHandler),
            (r"/auth/login", AuthLoginHandler),
            (r"/auth/logout", AuthLogoutHandler),
        ]
        # 设置博客的标题，模板目录，静态文件目录，xsrf，以及是否调试
        settings = dict(
            blog_title=u"Tornado Blog",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            ui_modules={"Entry": EntryModule},
            xsrf_cookies=True,
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            login_url="/auth/login",
            debug=True,
        )
       # 继承Application类的__init__函数加载进来
        super(Application, self).__init__(handlers, **settings)
        # Have one global connection to the blog DB across all handlers
       # 连接数据库
        self.db = torndb.Connection(
            host=options.mysql_host, database=options.mysql_database,
            user=options.mysql_user, password=options.mysql_password)

        self.maybe_create_tables()

    def maybe_create_tables(self):
        try:
            self.db.get("SELECT COUNT(*) from entries;")
        except MySQLdb.ProgrammingError:
            subprocess.check_call(['mysql',
                                   '--host=' + options.mysql_host,
                                   '--database=' + options.mysql_database,
                                   '--user=' + options.mysql_user,
                                   '--password=' + options.mysql_password],
                                  stdin=open('schema.sql'))


# 基类，继承自tornado.web.RequestHandler
class BaseHandler(tornado.web.RequestHandler):
    # 该装饰器，使db函数变成一个属性，便于后面直接使用
    # 使用self.db 调用mysql对象
    @property
    def db(self):
        return self.application.db

    # 获取当前用户
    def get_current_user(self):
        user_id = self.get_secure_cookie("blogdemo_user")  # 从cookie里获取当前用户的id
        if not user_id: return None
        return self.db.get("SELECT * FROM authors WHERE id = %s", int(user_id))   # delect获取用户信息

    def any_author_exists(self):
        return bool(self.db.get("SELECT * FROM authors LIMIT 1"))

# 首页
class HomeHandler(BaseHandler):
    def get(self):
        # 根据发布时间 获取blog信息
        entries = self.db.query("SELECT * FROM entries ORDER BY published "
                                "DESC LIMIT 5")
        if not entries:
            self.redirect("/compose")   #### /compose
            return
        self.render("home.html", entries=entries)


class EntryHandler(BaseHandler):
    def get(self, slug):
        entry = self.db.get("SELECT * FROM entries WHERE slug = %s", slug)
        # raise 触发一个错误信息
        if not entry: raise tornado.web.HTTPError(404)
        self.render("entry.html", entry=entry)


class ArchiveHandler(BaseHandler):
    def get(self):
        entries = self.db.query("SELECT * FROM entries ORDER BY published "
                                "DESC")
        self.render("archive.html", entries=entries)


class FeedHandler(BaseHandler):
    def get(self):
        entries = self.db.query("SELECT * FROM entries ORDER BY published "
                                "DESC LIMIT 10")
        self.set_header("Content-Type", "application/atom+xml")
        self.render("feed.xml", entries=entries)


class ComposeHandler(BaseHandler):
    @tornado.web.authenticated   #该装饰器, 判断用户是否登录，没有就跳转到登录页面
    # 点击进入blog详情，如果有，就直接渲染到页面就可以（单个详情页）
    def get(self):
        id = self.get_argument("id", None)    # 获取的单挑blog的id
        entry = None
        if id:
            entry = self.db.get("SELECT * FROM entries WHERE id = %s", int(id))
        self.render("compose.html", entry=entry)

    @tornado.web.authenticated
    def post(self):
        id = self.get_argument("id", None)
        title = self.get_argument("title")
        text = self.get_argument("markdown")
        html = markdown.markdown(text)
        if id:
            entry = self.db.get("SELECT * FROM entries WHERE id = %s", int(id))
            if not entry: raise tornado.web.HTTPError(404)
            slug = entry.slug
            self.db.execute(
                "UPDATE entries SET title = %s, markdown = %s, html = %s "
                "WHERE id = %s", title, text, html, int(id))
        else:

            """
            ###重点理解slug，截取文章的title的字段
            1)中文标题 
            2）英文标题
            3）没写标题
            """
            slug = unicodedata.normalize("NFKD", title).encode(
                "ascii", "ignore")
            slug = re.sub(r"[^\w]+", " ", slug)
            slug = "-".join(slug.lower().strip().split()) # 转成小写，再用“_”
            if not slug: slug = "entry"  #
            while True:
                e = self.db.get("SELECT * FROM entries WHERE slug = %s", slug)
                if not e: break
                slug += "-2" # 如果标题相同，在基础上-2;
            self.db.execute(
                "INSERT INTO entries (author_id,title,slug,markdown,html,"
                "published) VALUES (%s,%s,%s,%s,%s,UTC_TIMESTAMP())",
                self.current_user.id, title, slug, text, html)
        self.redirect("/entry/" + slug)  # 渲染的url+slug


class AuthCreateHandler(BaseHandler):
    def get(self):
        self.render("create_author.html")

    @gen.coroutine
    def post(self):
        if self.any_author_exists():
            raise tornado.web.HTTPError(400, "author already created")
        hashed_password = yield executor.submit(
            bcrypt.hashpw, tornado.escape.utf8(self.get_argument("password")),   # bcrypt加密
            # tornado.escape.utf8的字符串参数 转换成 字节 参数
            bcrypt.gensalt())

        # 入库操作
        author_id = self.db.execute(
            "INSERT INTO authors (email, name, hashed_password) "
            "VALUES (%s, %s, %s)",
            self.get_argument("email"), self.get_argument("name"),
            hashed_password)

        self.set_secure_cookie("blogdemo_user", str(author_id))
        self.redirect(self.get_argument("next", "/"))


class AuthLoginHandler(BaseHandler):
    def get(self):
        # If there are no authors, redirect to the account creation page.
        if not self.any_author_exists():
            self.redirect("/auth/create")
        else:
            self.render("login.html", error=None)

    @gen.coroutine
    def post(self):
        # 获取前端用户的email，再查询用户信息是否存储在authors表里
        author = self.db.get("SELECT * FROM authors WHERE email = %s",
                             self.get_argument("email"))
        # 不存在，提示error email not found
        if not author:
            self.render("login.html", error="email not found")
            return
        # 登录  输入的密码加密后的验证
        hashed_password = yield executor.submit(
            bcrypt.hashpw, tornado.escape.utf8(self.get_argument("password")),
            tornado.escape.utf8(author.hashed_password))
        # 密码相同
        # 存储用户的id 到cookie里面
        if hashed_password == author.hashed_password:
            self.set_secure_cookie("blogdemo_user", str(author.id))
            self.redirect(self.get_argument("next", "/"))   # 重定向一个页面
        else:
            self.render("login.html", error="incorrect password") # 不然 密码错误

"""
当Tornado构建重定向URL时，它还会给查询字符串添加一个next参数，
其中包含了发起重定向到登录页面的URL资源地址。
你可以使用像self.redirect(self.get_argument('next', '/'))这样的行来重定向登录后用户回到的页面。
"""

class AuthLogoutHandler(BaseHandler): # 退出
    def get(self):
        self.clear_cookie("blogdemo_user")   # 清除 cookie
        self.redirect(self.get_argument("next", "/"))  # 重定向,发送一个新的请求，参数为"/",get_argument为获得next参数的值，默认为"/"


class EntryModule(tornado.web.UIModule):
    def render(self, entry):
        return self.render_string("modules/entry.html", entry=entry)

# 入口函数
def main():
    tornado.options.parse_command_line()
    # 创建一个服务器
    http_server = tornado.httpserver.HTTPServer(Application())
    # 监听端口
    http_server.listen(options.port)
    # 启动服务
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
