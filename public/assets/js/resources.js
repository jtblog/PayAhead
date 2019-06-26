var create_account = '<form id="create-acct-form"> \
					    <div class="profile-card"> \
					        <div class="profile-back"></div> \
					        <button for = "profilepic-input" class="btn btn-primary border rounded-circle" type="button" id="profilepic-btn" style="width: 150px;height: 150px;padding: 0px;background-color: #5f9ea0;vertical-align: middle;margin-bottom: 10px;"> \
					        <input type="file" name = "profilepic-input" id="profilepic-input" onchange="previewImage(this);" accept="image/x-png, image/gif, image/jpeg" /> \
					        <img src="index.png" for = "profilepic-input" class="rounded-circle profile-pic" id="profilepic" /></button> \
					        <div \
					            class="input-group"> \
					            <div class="input-group-prepend"><span class="input-group-text">First Name :</span></div><input id = "firstname-input" type="text" required class="form-control" /> \
					            <div class="input-group-append"></div> \
					    </div> \
					    <div class="input-group"> \
					        <div class="input-group-prepend"><span class="input-group-text">Last Name :</span></div><input id = "lastname-input" type="text" required class="form-control" /> \
					        <div class="input-group-append"></div> \
					    </div> \
					    <div class="input-group"> \
					        <div class="input-group-prepend"><span class="input-group-text">Email :</span></div><input id = "email-input" type="email" required class="form-control" /> \
					        <div class="input-group-append"></div> \
					    </div> \
					    <div class="input-group"> \
					        <div class="input-group-prepend"><span class="input-group-text">Password :</span></div><input id = "password-input" type="password" required class="form-control" /> \
					        <div class="input-group-append"></div> \
					    </div> \
					    <div class="input-group"> \
					        <div class="input-group-prepend"><span class="input-group-text">BVN :</span></div><input type="text" id="bvn-input" required autocomplete="on" inputmode="numeric" class="form-control" /> \
					        <div class="input-group-append"></div> \
					    </div><button class="btn btn-primary create-acct-btn" type="submit" style="background-color: #5f9ea0;border-radius: 100px;border-color: #5f9ea0;margin-bottom: 10px;">Create Account</button></div> \
					</form>';