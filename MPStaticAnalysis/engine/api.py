import argparse 
import sys, os
import uuid
import json
import traceback

import constants as constantsModule
import utils.utility as utilityModule

from utils.logging import logger as LOGGER
from engine.lib.jaw.hybrid.state_values import StateValues


def analyse(appId, js_program, outDir):

	# js_program = list(set(js_program))
	
	if len(js_program) == 0:
		return False
	
	js_program = ['"' + item + '"' for item in js_program]
	param = ' --input='.join(js_program)

	# find the folder name of the program under analysis within the /outputs folder
	output_path = outDir + appId

	# random graph id
	graphid = uuid.uuid4().hex

	# build the property graph for the js program
	try:
		command = "node --max-old-space-size=32000 %s --input=%s --output=%s --lang=js --mode=csv --graphid=%s --prepocess=true"%(constantsModule.STATIC_ANALYZER_CLI_DRIVER_PATH, param, output_path, graphid)
		utilityModule.run_os_command(command, timeout=15*60)
	
	except:
		LOGGER.error(traceback.format_exc())
		return False

	return True


if __name__ == '__main__':
	analyse()
