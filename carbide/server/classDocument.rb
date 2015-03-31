class DocumentBase
	attr_accessor :name
	attr_accessor :project
	attr_accessor :clients
	
	def initialize(project, name)
		@project = project
		@name = name
		@revision = 0
		@data = Array.new(1, "");
		@data.insert(' ');
		@clients = { };
	end

	
	def addClient(client, ws)
		@clients[ws] = client 
	end
	
	def remClient(ws)
		@clients.delete(ws)
	end
	
	def getCurrentRevision()
		return @revision
	end

	def getRevisionData(revision)
		if (revision == @revision) 
			return @data
		else
			puts "This is NYI behavior -- #{revision} does not match #{@revision}"
			return 0
		end
		
	end
	
	
	def getHash(revision)
		@myString = @data.join('\n')
		puts "We should generate a hash here for this string: #{@myString}"
		return 0xFF
	end
	

end


class Document < DocumentBase
	def procMsg(client, jsonMsg)
		puts "Asked to process a message for myself: #{name} from client #{client.name}"
		if (self.respond_to?("procMsg_#{jsonMsg['command']}"))
			puts "Found a function handler for  #{jsonMsg['command']}"
			self.send("procMsg_#{jsonMsg['command']}", client, jsonMsg);
		elsif
			puts "There is no function to handle the incoming command #{jsonMsg['command']}"
		end
	end
	
	def procMsg_getContents(client, jsonMsg)
		@clientReply = {
			'replyType' => 'reply_getContents',
			'documentContents' => @data,
			'documentInfo' => {
				'documentRevision' => @revision,
				'numLines' => @data.length,
				'docHash' => getHash(@revision),
			}
		}
		@clientString = @clientReply.to_json
		@project.sendToClient(client, @clientString)
		puts "getContents(): Called #{jsonMsg}"
		puts "Returning:" 
		puts @clientReply
		
	end
	
	def procMsg_getInfo(client, jsonMsg)
		@clientReply = {
			'replyType' => 'reply_getInfo',
			'documentInfo' => {
				'documentRevision' => @revision,
				'numLines' =>  @data.length,
				'docHash' => getHash(@revision),
			}
		}
		@clientString = @clientReply.to_json
		@project.sendToClient(client, @clientString)
		puts "getInfo(): Called #{jsonMsg}"
		puts "Returning:" 
		puts @clientReply
	end
	
	def sendMsg_cInsertDataSingleLine(client, document, line, data, char, length, ldata)
		@clientReply = {
			'commandSet' => 'document',
			'command' => 'insertDataSingleLine',
			'targetDocument' => document,
			'insertDataSingleLine' => {
				'status' => TRUE,
				'hash' => 0xFF,
				'line' => line,
				'data' => data,
				'char' => char,
				'length' => length,
				'ldata' => ldata,
				'document' => document,
			},
			#Temporary, each command should come in with a hash so we can deal with fails like this and rectify them
		}
		@clientString = @clientReply.to_json
		@project.sendToClientsListeningExcept(client, document, @clientString)
	end
	
	def sendMsg_cDeleteDataSingleLine(client, document, line, data, char, length, ldata)
		@clientReply = {
			'commandSet' => 'document',
			'command' => 'deleteDataSingleLine',
			'targetDocument' => document,
			'deleteDataSingleLine' => {
				'status' => TRUE,
				'hash' => 0xFF,
				'line' => line,
				'data' => data,
				'char' => char,
				'length' => length,
				'ldata' => ldata,
				'document' => document,
			},
			#Temporary, each command should come in with a hash so we can deal with fails like this and rectify them
		}
		@clientString = @clientReply.to_json
		@project.sendToClientsListeningExcept(client, document, @clientString)

	end
	def procMsg_insertDataSingleLine(client, jsonMsg)
		line = jsonMsg['insertDataSingleLine']['line'];
		#data = jsonMsg['insertDataSingleLine']['data'][0].gsub("\n","")
		data = jsonMsg['insertDataSingleLine']['data'][0]
		char = jsonMsg['insertDataSingleLine']['ch'].to_i
		length = data.length
		puts "insertDataSingleLine(): Called #{jsonMsg}"
		if (@data[line].nil?)
			@data.push(data.to_str);
		else
			@str = @data.fetch(line).to_str
			if @str.length < char
				a = @str.length;
				while (a < char)
					a = @str.length
					@str.insert(a, " ")
					a += 1
				end
				
				puts "#{@str.length} is less than #{char}.. this may crash"
			end
			@str.insert(char, data)
			@data.fetch(line, @str)
			puts "OK! " + @data.fetch(line)
		end
		sendMsg_cInsertDataSingleLine(client, @name, line, data, char, length, @data[line])

	end
	
	
	# This is almost done, needs some tweaks!
	def procMsg_deleteDataSingleLine(client, jsonMsg)
		line = jsonMsg['deleteDataSingleLine']['line'];
		data = jsonMsg['deleteDataSingleLine']['data'][0].gsub("\n","")
		char = jsonMsg['deleteDataSingleLine']['ch'].to_i
		length = data.length
		puts "deleteDataSingleLine(): Called #{jsonMsg} .. deleting " + data.inspect
		if (@data[line].nil?)
			puts "Error: Delete character on line that doesn't exist"
			client.sendMsg_Fail('deleteDataSingleLine');
			return FALSE
		end
		@str = @data.fetch(line).to_str
		@substr = @str[char..(char + length - 1)]
		puts "Substr calculated to be " + @substr.inspect
		if @substr == data
			@begstr = @str[0..(char - 1)]
			@endstr = @str[(char + length + 1)..(@str.length)]
			if (!(@endstr.nil? || @begstr.nil?))
				@str = @begstr + @endstr
			else
				if !@begstr.nil? && @endstr.nil?
					@str = @begstr
				elsif !@endstr.nil? && @begstr.nil?
					@str = @endstr
				else
					@str = ""
				end
			end
			
			@data[line]= @str
			puts "OK! " + @substr + " should match " +  data
			puts @data.fetch(line, @str)
			sendMsg_cDeleteDataSingleLine(client, @name, line, data, char, length, @data[line])
			return TRUE
		else
			puts "Deleted data #{data} did not match data at string position #{char} with length #{length}! Server reports data is #{@substr}"
			client.sendMsg_Fail('deleteDataSingleLine');
			return FALSE
		end			
	end
	
	def procMsg_insertDataMultiLine(client, jsonMsg)
	end
	
	def procMsg_insertLine(client, jsonMsg)
	end
	
	def procMsg_deleteLine(client, jsonMsg)
	end
	
	def procMsg_deleteMultiLine(client, jsonMsg)
	end
	
	
	def procInput(line, char, data, revision)
		puts "Called with #{line} #{char} #{data} #{revision}"
		if (@revision == revision)
			puts "Revision same, no OT required"
			if !@data[line]
				puts "This is a new line"
				@data.push(data)
			else
				puts "This line exists"
				if (!@data.fetch(line).nil?)
					@data.fetch(line, @data.fetch(line).insert(char, data))
					#puts @data.fetch(line)
				else
					
					@data.fetch(line, @data.fetch(line).insert(char, data))
					#puts @data.fetch(line)
				end
				
			end
			@revision += 1
			return TRUE
		else
			puts "We need OT in this case, failure -- was #{revision}, but we have #{@revision}"
			return FALSE
		end
	end

end
