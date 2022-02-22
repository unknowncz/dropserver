import os
import socket
import threading
import email
from io import StringIO
import time
import traceback


class handler:
    def __init__(self, conn:socket.socket) -> None:
        self.conn = conn
        self.headers, self.response = b'', b''
        self.filetypes = {
            'html':b'text/html',
            'css':b'text/css',
            'ico':b'image/ico',
            'js':b'text/javascript'
        }
        self.lookupTable = {
            '/':self.servefile,
            '/favicon.ico':self.servefile,
            '/main.css':self.servefile,
            '/main.js':self.servefile,
            '/fsys.css':self.servefile,
            '/upload':self.savefile,
            '/getfiles':self.foldercontents,
            '/getfile':self.filedownload
        }
        self.rq = conn.recv(1024).decode()
        self.request, headers, *overflow = self.rq.split('\r\n', 1) + ['', '']
        message=email.message_from_file(StringIO(headers))
        self.h=dict(message.items())
        if self.request.split(' ')[1]!='/':
            self.lookupTable.get('/' + self.request.split(' ')[1].split('/')[1], self.default())(self.request.split(' ')[1], self.h)
        else:
            self.servefile(self.request.split(' ')[1])

    def setheaders(self, headers:list[bytes], *overflow):
        self.headers+=b'\n\r'.join(headers)

    def endheaders(self, *overflow):
        self.conn.sendall(self.headers+b'\n\r\n\r')

    def write(self, content, *overflow):
        self.response+=content

    def flush(self, *overflow):
        self.conn.sendall(self.response)
        time.sleep(0.1)
        self.conn.close()

    def default(self, *overflow):
        pass

    def filedownload(self, path, *overflow):
        relative_directory = '/'.join(path.split('/')[2:]).replace('\\', '').replace('//', '')
        with open(f'{__file__}\\..\\{relative_directory}', 'rb') as f:
            self.setheaders([b'HTTP/1.1 200 OK',  b'Accept-Ranges:bytes',  b'Content-Length:' + str(os.path.getsize(f'{__file__}\\..\\{relative_directory}')).encode()])
            self.endheaders()
            self.write(b'\r\n'.join(f.readlines()))
            self.flush()

    def foldercontents(self, folderpath, *overflow):
        relative_directory = '/'.join(folderpath.split('/')[2:]).replace('.', '').replace('//', '')
        direcc = '<>'.join(os.listdir(f'{__file__}\\..\\{relative_directory}')) + '\r\n'
        h = [b'HTTP/1.1 200 OK',  b'Accept-Ranges:bytes',  b'Content-Length:' + str(len(direcc)).encode()]
        self.setheaders(h)
        self.endheaders()
        time.sleep(0.1)
        self.write(direcc.encode())
        self.flush()

    def savefile(self, _, h, *overflow):
        try:
            b = self.h['Content-Type'].strip('multipart/form-data; boundary=')
            temp = self.rq.split(f'--{b}')[2].split('\r\n', 3)
            for i in temp:
                try:
                    filename = i.split('filename=')[1].strip('"')
                except:
                    pass
            with open(f'{__file__}\\..\\uploads\\{filename}', 'x')as f:
                try:
                    f.write(temp[-1].split('\r\n')[1])
                    x = len(temp[-1].split('\r\n')[1])
                except:
                    x = 0
                while int(self.h['Content-Length']) > x:
                    if int(self.h['Content-Length']) > x:break
                    f.write(conn.recv(2048).decode().strip().strip(f'--{b}'))
                    x += 2048
                self.setheaders([b'HTTP/1.1 200 OK',  b'Accept-Ranges:bytes', b'Connection:close'])
                self.endheaders()
                self.write(b' ')
                self.flush()
        except Exception:
            print(traceback.format_exc())

    def servefile(self, filename:str, *overflow):
        try:
            ftype = self.filetypes[filename.split('.')[-1]]
        except:
            ftype = b'text/html'
        try:
            if filename == '/':
                with open(f'{__file__}\\..\\main.html', 'rb')as f:
                    x = f.readlines()
                    h = [b'HTTP/1.1 200 OK', b'Content-type:' + ftype, b'Connection:close', b'Content-Length:' + str(len(b''.join(x))).encode(), b'Accept-Ranges:bytes']
                    self.setheaders(h)
                    self.endheaders()
                    time.sleep(0.1)
                    self.write(b''.join(x))
            else:
                with open(f'{__file__}\\..{filename}', 'rb')as f:
                    x = f.readlines()
                    h = [b'HTTP/1.1 200 OK', b'Content-type:' + ftype, b'Connection:close', b'Content-Length:' + str(len(b''.join(x))).encode(), b'Accept-Ranges:bytes']
                    self.setheaders(h)
                    self.endheaders()
                    time.sleep(0.1)
                    self.write(b''.join(x))
        except FileNotFoundError:
            h = [b'HTTP/1.1 404 NOT FOUND', b'Connection:close', b'Content-type:' + ftype, b'Accept-Ranges:bytes']
            self.setheaders(h)
            self.endheaders()
            time.sleep(0.1)
            self.write(b' ')
        self.flush()
        return True


if __name__ == '__main__':
    # server:socket.socket = socket.create_server(('', 8080), family=socket.AF_INET, backlog=10, reuse_port=True) # why no work
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER, 10)
        server.bind(('', 8080))
        while True:
            try:
                server.listen(10)
                conn, addr = server.accept()
                with conn:
                    time.sleep(0.2)
                    threading.Thread(target=handler, args=(conn,)).run()
            except Exception:
                traceback.print_exc()
