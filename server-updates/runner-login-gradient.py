import hashlib,pathlib,subprocess,tempfile

def decrypt_verified(payload, cipher_sha256, passphrase, plain_sha256):
    if hashlib.sha256(payload).hexdigest()!=cipher_sha256:
        raise ValueError('Download checksum mismatch')
    with tempfile.TemporaryDirectory(prefix='centr-decrypt-') as directory:
        encrypted=pathlib.Path(directory)/'package.enc'
        encrypted.write_bytes(payload)
        encrypted.chmod(0o600)
        result=subprocess.run(['openssl','enc','-d','-aes-256-cbc','-pbkdf2','-iter','200000','-md','sha256','-pass','stdin','-in',str(encrypted)],input=(passphrase+'\n').encode(),capture_output=True,check=True)
    if hashlib.sha256(result.stdout).hexdigest()!=plain_sha256:
        raise ValueError('Installer checksum mismatch')
    return result.stdout

URL='https://raw.githubusercontent.com/stalkerxz9-cloud/crm/centr-tsr-login-gradient-20261105/server-updates/centr-tsr-login-gradient.enc'
CIPHER_SHA='1ce66c1192d60c6057abe2ddb6a0ffcac93981d0e79d57baf0f62750c48fc873'
PLAIN_SHA='adc5cfea313c25043c8a13d70e6a63e6b90de07afe02a7df912ab65e1b3a4b6c'

import os,shutil,sys,urllib.request
if os.geteuid()!=0:raise SystemExit('Run in the VPS root console')
if not shutil.which('openssl'):raise SystemExit('OpenSSL is required')
key=sys.stdin.readline().strip()
if len(key)!=64 or any(c not in '0123456789abcdef' for c in key):raise SystemExit('Invalid package key')
print('Центр ТСР: плавный градиент без полосы',flush=True)
with urllib.request.urlopen(URL,timeout=120) as response:payload=response.read(2000000)
data=decrypt_verified(payload,CIPHER_SHA,key,PLAIN_SHA)
with tempfile.TemporaryDirectory(prefix='centr-gradient-update-',dir='/root') as directory:
    package=pathlib.Path(directory)/'update.zip'
    package.write_bytes(data)
    package.chmod(0o600)
    subprocess.run([sys.executable,str(package)],check=True)
