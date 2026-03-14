import requests
import hashlib
import hmac
import time
import uuid

# URL API
API = "https://YOUR-WORKER.workers.dev/api/check"

# secret phải giống trong worker
SECRET = "CHANGE_THIS_SECRET"


# tạo device id
def get_device():

    return str(uuid.getnode())


# tạo HMAC
def make_sig(device, key, t):

    msg = f"{device}{key}{t}".encode()

    sig = hmac.new(
        SECRET.encode(),
        msg,
        hashlib.sha256
    ).hexdigest()

    return sig


# check key
def check_key(key):

    device = get_device()

    t = str(int(time.time()))

    sig = make_sig(device, key, t)

    data = {
        "device": device,
        "key": key,
        "time": t,
        "sig": sig
    }

    r = requests.post(API, json=data)

    return r.json()


# test
if __name__ == "__main__":

    key = input("Enter key: ")

    result = check_key(key)

    print(result)